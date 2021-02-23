import { Slice } from '@bigtest/atom';
import { Operation, fork } from 'effection';
import { Simulation } from '../simulation/simulation';
import { Thing, SimulatorTags, SimulationsState } from '../types';
import { map } from '../server/synchronize';
import { Channel } from '@effection/channel';
import { subscribe, Subscription, SymbolSubscribable } from '@effection/subscription';
import { assert } from 'assert-ts';
import { getArbitraryInstance } from '../fakery/arbitrary';

export type SimulationEvents = {
  kind: 'SIMULATION_CREATED';
  simulation: Simulation<SimulatorTags>;
};

export type StateChangedEvents = {
  kind: 'THING_CREATED';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thing: Thing<any>;
};

export type StateEvents = SimulationEvents | StateChangedEvents;

export interface StatePublisher {
  start(): Operation<void>;
  [SymbolSubscribable](): Operation<Subscription<StateEvents>>;
}

export function createStatePublisher(atom: Slice<SimulationsState>): StatePublisher {
  const channel = new Channel<StateEvents>();

  function* start() {
    yield fork(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      map(atom.slice('simulations'), function* (simulationState, simulationKey) {
        const simulation = Object.values(simulationState.get())[0] as Simulation<SimulatorTags>;

        const message: SimulationEvents = {
          kind: 'SIMULATION_CREATED',
          simulation,
        } as const;

        // console.dir(message);

        channel.send(message);

        for (const simKey of Object.keys(simulation.simulators)) {
          const tag = simKey as SimulatorTags;
          const simulator = simulation.simulators[tag];

          yield fork(
            map(
              atom.slice('simulations', simulation.uuid, 'simulators', simulator.uuid, 'things'),
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              function* (thingState, thingKey): Operation<void> {
                const thing = thingState.get();
                assert(!!thing.parentUid, `thing ${thing.uuid} has no parentUid`);

                const thingCreatorSimulator = atom
                  .slice('simulations', simulation.uuid, 'simulators', thing.parentUid, 'simulator')
                  .get();

                const message: StateChangedEvents = {
                  kind: 'THING_CREATED',
                  thing,
                } as const;

                channel.send(message);

                // console.dir(message);

                for (const current of Object.keys(atom.slice('simulations', simulation.uuid, 'simulators').get())) {
                  const simulatorSlice = atom.slice('simulations', simulation.uuid, 'simulators', current, 'simulator');

                  if (simulatorSlice.get().uuid === thingCreatorSimulator.uuid) {
                    continue;
                  }

                  const thing = message.thing;

                  // TODO: we need a better way of stopping infite updates
                  if (
                    simulatorSlice
                      .get()
                      .store.getAll()
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      .find((a: any) => a.id === thing.value.id)
                  ) {
                    continue;
                  }

                  const kind = simulatorSlice.get().thingMap[thing.kind];

                  const type = simulatorSlice.get().getIntermediateType(kind);

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const attributes = getArbitraryInstance(type) as any;

                  for (const key of Object.keys(thing.value)) {
                    if (attributes[key]) {
                      attributes[key] = thing.value[key];
                    }
                  }

                  const newThing = simulation.create({
                    kind,
                    simulator: simulatorSlice.get().tag,
                    attributes,
                  });

                  const parentUid = simulatorSlice.get().parentUid;

                  assert(!!parentUid, `no parentUid on simulator ${simulatorSlice.get().uuid}`);

                  atom
                    .slice('simulations', parentUid, 'simulators', simulatorSlice.get().uuid, 'things', newThing.uuid)
                    .set(newThing);
                }
              },
            ),
          );
        }
      }),
    );
  }

  return {
    *[SymbolSubscribable](): Operation<Subscription<StateEvents>> {
      return yield subscribe(channel);
    },
    start,
  };
}
