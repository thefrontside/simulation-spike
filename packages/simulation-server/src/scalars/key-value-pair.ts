/* eslint-disable @typescript-eslint/no-explicit-any */
import { scalarType } from '@nexus/schema';
import { Kind, print } from 'graphql/language';
import { isObject } from '../utils/isObject';
import { assert } from 'assert-ts';
import { ObjectValueNode } from 'graphql';

const parseObject = (type: string, ast: ObjectValueNode, variables: any) => {
  const value = Object.create(null);
  ast.fields.forEach((field) => {
    value[field.name.value] = parseLiteral(type, field.value, variables);
  });

  return value;
};

function parseLiteral(type: string, ast: any, variables: any) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(type, ast, variables);
    case Kind.LIST:
      return ast.values.map((n: any) => parseLiteral(type, n, variables));
    case Kind.NULL:
      return null;
    case Kind.VARIABLE:
      return variables ? variables[ast.name.value] : undefined;
    default:
      throw new TypeError(`${type} cannot represent value: ${print(ast)}`);
  }
}

export const KeyValuePair = scalarType({
  name: 'KeyValuePair',
  asNexusMethod: 'keyValuePair',
  serialize(value) {
    assert(isObject(value), `value ${value} is not an object`);

    return value;
  },
  parseValue(value) {
    assert(isObject(value), `value ${value} is not an object`);

    return value;
  },
  parseLiteral: (ast, variables) => {
    if (ast.kind !== Kind.OBJECT) {
      throw new TypeError(`KeyValuePair cannot represent non-object value: ${print(ast)}`);
    }

    return parseObject('KeyValuePair', ast, variables);
  },
});
