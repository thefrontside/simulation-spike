import { gatewayFactory } from '../simulators/gateway/gatewaySimulator';
import { auth0Factory } from '../simulators/auth0/auth0simulator';
import { Generate } from '../fakery/arbitrary';
import { Thing, Simulator, SimulatorTags, SimulationSimulatorStatuses } from '../types';
import { assert } from 'assert-ts';
import { v4 } from 'uuid';

const getSimulator = <S extends SimulatorTags>(simulation: Simulation<S>) => async <SIMS extends SimulatorTags>(
  tag: SIMS,
): Promise<Simulator<SIMS>> => {
  const simulator = {
    auth0: auth0Factory(),
    gateway: gatewayFactory(),
  }[tag];

  simulator.parentUid = simulation.uuid;

  return (simulator as unknown) as Simulator<SIMS>;
};

export class Simulation<SIMS extends SimulatorTags> {
  public simulators: Record<SIMS, Simulator<SIMS>>;
  public readonly uuid: string;

  constructor(public name: string, public generate: Generate, uuid?: string, public timeToLiveInMs: number = 500) {
    this.uuid = uuid ?? v4();
    this.simulators = {} as Record<SIMS, Simulator<SIMS>>;
  }

  create<SIM extends SIMS & SimulatorTags, T extends { id: string } | undefined>({
    simulator,
    kind,
    identifier,
    attributes,
  }: {
    simulator: SIM;
    kind: string;
    identifier?: string;
    attributes?: T;
  }): Thing<T> {
    const sim = this.simulators[simulator];

    assert(!!sim, `no simulator found for ${simulator}`);

    const raw = attributes ?? this.generate(sim.getIntermediateType(kind));

    assert(!!raw, `no instance found for ${kind}`);

    const entity = sim.create(kind, raw) as T;

    const uuid = identifier || v4();

    return {
      uuid,
      parentUid: sim.uuid,
      kind,
      value: entity,
    };
  }

  simulatorsStatuses(): SimulationSimulatorStatuses[] {
    const statuses: SimulationSimulatorStatuses[] = [];

    for (const sim of Object.values<Simulator<SIMS>>(this.simulators)) {
      switch (sim.status.kind) {
        case 'RUNNING':
          statuses.push({ kind: sim.tag, status: sim.status.kind, url: sim.status.url });
          break;
        case 'ERROR':
          statuses.push({ kind: sim.tag, status: sim.status.kind, error: sim.status.error });
      }
    }

    return statuses;
  }

  static async createSimulation<SSIMS extends SimulatorTags>(
    name: string,
    simulators: SSIMS | SSIMS[],
    generate: Generate,
    uuid?: string,
    timeToLiveInMs = 500,
  ): Promise<Simulation<SSIMS>> {
    simulators = Array.isArray(simulators) ? simulators : [simulators];

    const simulation = new Simulation<SSIMS>(name, generate, uuid, timeToLiveInMs);

    for (const sim of await Promise.all<Simulator<SSIMS>>(simulators.map(getSimulator(simulation)))) {
      assert(!!sim, `no simulator`);
      assert(!!sim.parentUid, `no parentUid for simulation`);

      simulation.simulators[sim.tag] = sim;
    }

    return simulation;
  }
}
