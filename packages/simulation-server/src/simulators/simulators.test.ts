/* eslint-disable jest/no-disabled-tests */
import { createAtom, Slice } from '@bigtest/atom';
import { Context, Operation, run } from 'effection';
import { SimulationContext } from '../context/SimulationContext';
import { Authh0Types } from './auth0/auth0simulator';
import { SimulationsState, Thing } from '../types';
import { createStatePublisher, StateEvents, StatePublisher } from '../state-publisher/state-publisher';
import { subscribe, Subscription } from '@effection/subscription';
import { assert } from 'assert-ts';
import { resetAtom } from '@bigtest/atom/dist/atom';

type World = Context & { spawn<T>(operation: Operation<T>): Promise<T> };

const initialState: SimulationsState = {
  simulations: {},
};

describe('simulators', () => {
  let simulationContext: SimulationContext;
  let currentWorld: World;
  let statePublisher: StatePublisher;
  let atom: Slice<SimulationsState>;

  beforeAll(() => {
    currentWorld = run(undefined) as World;
  });

  beforeAll(async () => {
    atom = createAtom(initialState);

    statePublisher = createStatePublisher(atom);

    currentWorld.spawn(statePublisher.start());

    simulationContext = new SimulationContext(atom, statePublisher);
  });

  afterAll(() => {
    resetAtom(atom);
    currentWorld.halt();
  });

  describe('THING_CREATED', () => {
    describe('single event', () => {
      let thing: Thing<Authh0Types>;
      let subscription: Subscription<StateEvents>;

      beforeEach(async () => {
        const { uuid } = await simulationContext.createSimulation('test', 'auth0');

        subscription = await currentWorld.spawn(subscribe(statePublisher));

        thing = simulationContext.create<Authh0Types>({
          simulationID: uuid,
          kind: 'Token',
          simulator: 'auth0',
        }).attributes;
      });

      it('should receive THING_CHANGED events', async () => {
        await subscription.next();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { value } = (await subscription.next()) as any;

        assert(value && value.kind === 'THING_CREATED', `no THING_CREATED event, got ${value?.kind}`);
        expect(value.thing.uuid).toBe(thing.uuid);
      });
    });
  });
});
