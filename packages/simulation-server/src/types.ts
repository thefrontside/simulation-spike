/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from 'io-ts';
import { Simulation } from './simulation/simulation';

export type GetTag<T extends Simulator<any>> = T extends Simulator<infer Tag> ? Tag : never;

export type SimulatorTags = 'auth0' | 'gateway';

export type SimulatorState = {
  simulator: Simulator<SimulatorTags>;
  things: Record<string, Thing<any>>;
};

export type SimulationState = {
  simulation: Simulation<SimulatorTags>;
  simulators: Record<string, SimulatorState>;
};

export type SimulationsState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulations: Record<string, SimulationState>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
};

export interface Persistable {
  uuid: string;
  parentUid?: string;
}

export type Thing<T = unknown> = Persistable & {
  kind: string;
  value: T;
};

export interface Store {
  clear(): void;
  get<T>(type: string, id: string): T;
  getAll<T>(): T[];
  create(type: string, args: any[]): any;
  getBy<S extends (args: any[]) => any>(type: any, selector: S): any;
}

export interface SimulatorProvider {
  store: Store;
}

export interface Scenario<Tag extends string = string> {
  tag: Tag;
  desription?: string;
  run(): void;
}

export type Simulator<Tag extends SimulatorTags> = Persistable & {
  uuid: string;
  tag: Tag;
  provider?: SimulatorProvider;
  store: Store;
  getTypes(): any;
  getIntermediateType<K extends string>(k: K): t.TypeC<any>;
  create<T extends { id: string }>(tag: string, attributes: any): T;
  thingMap: Record<string, string>;
};

export type SimulationProps = { uuid: string; name: string };

export type SimulationResult = {
  success: boolean;
  message: string;
};

export type CreateResult = SimulationResult & {
  attributes: Thing<any>;
};
