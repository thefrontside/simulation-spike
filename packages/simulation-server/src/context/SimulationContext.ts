import { Simulation } from '../simulation/simulation';
import {
  SimulatorTags,
  CreateResult,
  SimulationsState,
  Simulator,
  SimulationState,
  SimulationProps,
  Thing,
} from '../types';
import { assert } from 'assert-ts';
import { Slice } from '@bigtest/atom';
import { StatePublisher } from '../state-publisher/state-publisher';
import { getArbitraryInstance } from '../fakery/arbitrary';

export const SimulatorsKey = 'simulators';

const updateSimulatorThings = (atom: Slice<SimulationsState>) => (simulationUuid: string) => (
  simulatorUuid: string,
  thing: Thing,
) =>
  atom.slice('simulations', simulationUuid, 'simulators', simulatorUuid, 'things').update((s) => {
    s[thing.uuid] = {
      ...(s[thing.uuid] || {}),
      ...thing,
    };

    return s;
  });

export class SimulationContext {
  constructor(public atom: Slice<SimulationsState>, public publisher: StatePublisher) {}

  async createSimulation<SIMS extends SimulatorTags>(
    name: string,
    simulators: SIMS | SIMS[],
    uuid?: string,
    timeToLiveInMs = 500,
  ): Promise<SimulationProps> {
    if (typeof uuid !== 'undefined') {
      const existing = this.atom.slice('simulations', uuid).get();

      if (existing?.simulation) {
        return {
          uuid: existing.simulation.uuid,
          name,
        };
      }
    }

    name = name ?? simulators;

    const simulation = await Simulation.createSimulation<SIMS>(name, simulators, uuid, timeToLiveInMs);

    this.atom.slice('simulations').update((s) => {
      s[simulation.uuid] = ({
        simulation,
        simulators: {},
      } as unknown) as SimulationState;

      return s;
    });

    for (const simKey of Object.keys(simulation.simulators)) {
      const tag = simKey as SIMS;
      const simulator: Simulator<typeof tag> = simulation.simulators[tag];

      this.atom.slice('simulations', simulation.uuid, 'simulators').update((s) => ({
        ...s,
        [simulator.uuid]: {
          simulator,
          things: {},
        },
      }));
    }

    return {
      uuid: simulation.uuid,
      name,
    };
  }

  create<T extends { id: string } | undefined>({
    simulationID,
    simulator: tag,
    kind,
    identifier,
    attributes,
  }: {
    simulationID: string;
    simulator: SimulatorTags;
    kind: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    identifier?: any;
    attributes?: T;
  }): CreateResult {
    const simulationSlice = this.atom.slice('simulations', simulationID);

    const simulation = simulationSlice.slice('simulation').get();

    assert(!!simulation, `could not find a simulation for ${simulationID}`);

    const thing = simulation.create({
      kind,
      simulator: tag,
      identifier,
      attributes: attributes,
    });

    const simulator = simulation.simulators[tag];

    const simulatorsSlice = simulationSlice.slice('simulators');

    updateSimulatorThings(this.atom)(simulation.uuid)(simulator.uuid, thing);

    for (const [key, simState] of Object.entries(simulatorsSlice.get())) {
      const sim = simState.simulator;

      if (key === simulator.uuid) {
        continue;
      }

      if (
        sim.store
          .getAll()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .find((a: any) => a.id === thing.value?.id)
      ) {
        continue;
      }

      const kind = sim.thingMap[thing.kind];

      const type = sim.getIntermediateType(kind);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const attributes: any = getArbitraryInstance(type);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const key of Object.keys(thing.value as any)) {
        if (attributes[key]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          attributes[key] = (thing.value as any)[key];
        }
      }

      const newThing = simulation.create({
        kind,
        simulator: sim.tag,
        attributes,
      });

      const parentUid = sim.parentUid;

      assert(!!parentUid, `no parentUid on simulator ${sim.uuid}`);

      updateSimulatorThings(this.atom)(simulation.uuid)(sim.uuid, newThing);
    }

    // console.dir('gateway');
    // console.dir(simulation.simulators?.gateway?.store?.getAll());
    // console.dir('auth0');
    // console.dir(simulation.simulators?.auth0?.store?.getAll());

    return {
      success: true,
      message: `a thing of type ${kind} was successfully added to the store`,
      attributes: thing,
    };
  }
}
