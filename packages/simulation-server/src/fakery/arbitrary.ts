/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { record, keys } from 'fp-ts/lib/Record';
import * as t from 'io-ts';
import * as fc from 'fast-check';
import { generateDateArbitrary, generateStringArbitrary } from './fakery';
import { assert } from 'assert-ts';

type ArrayType = t.ArrayType<HasArbitrary>;
type RecordType = t.DictionaryType<t.StringType, HasArbitrary>;
type StructType = t.InterfaceType<{ [K: string]: t.TypeOf<HasArbitrary> }>;
type TupleType = t.TupleType<Array<HasArbitrary>>;
type UnionType = t.UnionType<Array<HasArbitrary>>;
type BrandedType = t.RefinementType<HasArbitrary>;
type IntersectionType = t.IntersectionType<Array<HasArbitrary>>;

export type HasArbitrary =
  | t.UnknownType
  | t.UndefinedType
  | t.NullType
  | t.VoidType
  | t.StringType
  | t.NumberType
  | t.BooleanType
  | t.KeyofType<any>
  | t.LiteralType<any>
  | ArrayType
  | RecordType
  | StructType
  | TupleType
  | UnionType
  | BrandedType
  | IntersectionType;

function getProps(codec: t.InterfaceType<any> | t.ExactType<any> | t.PartialType<any>): t.Props {
  switch (codec._tag) {
    case 'InterfaceType':
      return codec.props;
    default:
      throw new Error(`unknown codec tag for getProps ${codec._tag}`);
  }
}

type KV<T> = { k: string; v: T };

const isKV = (x: any): x is KV<any> => {
  return 'k' in x;
};

const objectTypes = ['ExactType', 'InterfaceType', 'PartialType'];

export function getArbitrary<T extends HasArbitrary>(current: T | [string | undefined, T]): fc.Arbitrary<t.TypeOf<T>> {
  let propName: string | undefined;
  let codec: T;

  if (isKV(current)) {
    propName = current.k;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    codec = current[current.k];
  } else {
    codec = current as any;
  }

  const type: HasArbitrary = codec;

  switch (type._tag) {
    case 'UnknownType':
      return fc.anything() as any;
    case 'UndefinedType':
    case 'VoidType':
      return fc.constant(undefined) as any;
    case 'NullType':
      return fc.constant(null) as any;
    case 'StringType':
      return generateStringArbitrary(propName as string) as any;
    case 'NumberType':
      return fc.float() as any;
    case 'BooleanType':
      return fc.boolean() as any;
    case 'KeyofType':
      return fc.oneof(...keys(type.keys).map(fc.constant)) as any;
    case 'LiteralType':
      return fc.constant(type.value);
    case 'ArrayType':
      return fc.array(getArbitrary(type.type));
    case 'InterfaceType':
      // eslint-disable-next-line no-case-declarations
      const mapped: any = {};
      for (const [k, v] of Object.entries(getProps(type))) {
        mapped[k] = { k, [k]: v };
      }
      return fc.record(record.map(mapped as any, getArbitrary as any) as any) as any;
    case 'TupleType':
      return (fc.tuple as any)(...type.types.map(getArbitrary));
    case 'UnionType':
      return fc.oneof(...type.types.map(getArbitrary)) as any;
    case 'RefinementType':
      switch (type.name) {
        case 'UUID':
          return fc.uuid();
        case 'Token':
          return fc.string();
        default:
          throw new Error(`unknown refinementType ${type.name}`);
      }
    case 'IntersectionType':
      const tag = type.types[0]?._tag;
      assert(!!tag, `undefined for IntersectionType ${type}`);

      const isObjectIntersection = objectTypes.includes(tag);

      return isObjectIntersection
        ? (fc.tuple as any)(...type.types.map((t) => getArbitrary(t)))
            // eslint-disable-next-line @typescript-eslint/ban-types
            .map((values: Array<object>) => Object.assign({}, ...values))
            .filter(type.is)
        : fc.oneof(...type.types.map((t) => getArbitrary(t))).filter(type.is);
    default:
      if (type.name === 'Date') {
        assert(!!propName, `no date field for ${type}`);

        return generateDateArbitrary(propName);
      }
      throw new Error(`unknown codec tag found for ${type}`);
  }
}

export function getArbitraryInstance<T extends HasArbitrary, R>(current: T | [string | undefined, T]): R {
  return (fc.sample(getArbitrary(current))[0] as unknown) as R;
}
