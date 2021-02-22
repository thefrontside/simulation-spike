import { gatewayFactory } from '../simulators/gateway/gatewaySimulator';
import { auth0Factory } from '../simulators/auth0/auth0simulator';
import { generateUUID4 } from '../fakery/fakery';
import { getArbitraryInstance } from '../fakery/arbitrary';
import { Thing, Simulator, SimulatorTags } from '../types';
import { assert } from 'assert-ts';

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
  public readonly uuid;
  constructor(public name: string, uuid?: string, public timeToLiveInMs: number = 500) {
    this.uuid = uuid ?? generateUUID4();
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

    const raw = attributes ?? getArbitraryInstance(sim.getIntermediateType(kind));

    assert(!!raw, `no instance found for ${kind}`);

    const entity = sim.create(kind, raw) as T;

    const uuid = identifier || generateUUID4();

    return {
      uuid,
      parentUid: sim.uuid,
      kind,
      value: entity,
    };
  }

  static async createSimulation<SSIMS extends SimulatorTags>(
    name: string,
    simulators: SSIMS | SSIMS[],
    uuid?: string,
    timeToLiveInMs = 500,
  ): Promise<Simulation<SSIMS>> {
    simulators = Array.isArray(simulators) ? simulators : [simulators];

    const simulation = new Simulation<SSIMS>(name, uuid, timeToLiveInMs);

    for (const sim of await Promise.all<Simulator<SSIMS>>(simulators.map(getSimulator(simulation)))) {
      assert(!!sim, `no simulator`);
      assert(!!sim.parentUid, `no parentUid for simulation`);

      simulation.simulators[sim.tag] = sim;
    }

    return simulation;
  }
}
