/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */

import * as ctx from "./../dist/context/SimulationContext"
import * as types from "./../dist/types"
import { core } from "@nexus/schema"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    keyValuePair<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "KeyValuePair";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    keyValuePair<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "KeyValuePair";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  CreateSimulationResult: { // input type
    uuid?: string | null; // String
  }
}

export interface NexusGenEnums {
  AvailableSimulators: "auth0" | "gateway"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  KeyValuePair: any
}

export interface NexusGenObjects {
  CreateResult: types.CreateResult;
  Mutation: {};
  Query: {};
  Simulation: { // root type
    name?: string | null; // String
    uuid?: string | null; // String
  }
  SimulationResult: types.SimulationResult;
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  CreateResult: { // field return type
    attributes: NexusGenScalars['KeyValuePair'] | null; // KeyValuePair
    message: string | null; // String
    success: boolean | null; // Boolean
  }
  Mutation: { // field return type
    create: NexusGenRootTypes['CreateResult'] | null; // CreateResult
    createSimulation: NexusGenRootTypes['Simulation'] | null; // Simulation
  }
  Query: { // field return type
    ok: boolean; // Boolean!
  }
  Simulation: { // field return type
    name: string | null; // String
    uuid: string | null; // String
  }
  SimulationResult: { // field return type
    message: string | null; // String
    success: boolean | null; // Boolean
  }
}

export interface NexusGenFieldTypeNames {
  CreateResult: { // field return type name
    attributes: 'KeyValuePair'
    message: 'String'
    success: 'Boolean'
  }
  Mutation: { // field return type name
    create: 'CreateResult'
    createSimulation: 'Simulation'
  }
  Query: { // field return type name
    ok: 'Boolean'
  }
  Simulation: { // field return type name
    name: 'String'
    uuid: 'String'
  }
  SimulationResult: { // field return type name
    message: 'String'
    success: 'Boolean'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    create: { // args
      attributes?: NexusGenScalars['KeyValuePair'] | null; // KeyValuePair
      simulationID: string; // ID!
      simulator: NexusGenEnums['AvailableSimulators']; // AvailableSimulators!
      type: string; // String!
    }
    createSimulation: { // args
      name: string; // String!
      simulators: Array<NexusGenEnums['AvailableSimulators'] | null>; // [AvailableSimulators]!
      timeToLiveInMS?: number | null; // Int
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: ctx.SimulationContext;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}