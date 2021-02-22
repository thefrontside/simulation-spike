import { Simulation } from '../simulation/simulation';
import { SimulatorTags, CreateResult, SimulationsState, Simulator, SimulationState, SimulationProps } from '../types';
import { assert } from 'assert-ts';
import { Slice } from '@bigtest/atom';
import { StatePublisher } from '../state-publisher/state-publisher';

export const SimulatorsKey = 'simulators';

export class SimulationContext {
  constructor(public atom: Slice<SimulationsState>, public publisher: StatePublisher) {}

  async createSimulation<SIMS extends SimulatorTags>(
    name: string,
    simulators: SIMS | SIMS[],
    timeToLiveInMs = 500,
  ): Promise<SimulationProps> {
    name = name ?? simulators;

    const simulation = await Simulation.createSimulation<SIMS>(name, simulators, timeToLiveInMs);

    this.atom.slice('simulations').update((s) => {
      if (typeof s[simulation.uuid] === 'undefined') {
        s[simulation.uuid] = ({
          simulation,
          simulators: {},
        } as unknown) as SimulationState;
      }

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

    simulationSlice.slice('simulators', simulator.uuid, 'things').update((things) => ({
      ...things,
      [thing.uuid]: {
        ...thing,
      },
    }));

    return {
      success: true,
      message: `a thing of type ${kind} was successfully added to the store`,
      attributes: thing,
    };
  }
}
