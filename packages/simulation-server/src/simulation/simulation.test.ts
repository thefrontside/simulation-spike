/* eslint-disable jest/no-disabled-tests */
import { createAtom, Slice } from '@bigtest/atom';
import { Context, Operation, run } from 'effection';
import { SimulationContext } from '../context/SimulationContext';
import { Authh0Types } from '../simulators/auth0/auth0simulator';
import { SimulationsState, Thing } from '../types';
import {
  createStatePublisher,
  SimulationEvents,
  StateEvents,
  StatePublisher,
} from '../state-publisher/state-publisher';
import { subscribe, Subscription } from '@effection/subscription';
import { assert } from 'assert-ts';
import { resetAtom } from '@bigtest/atom/dist/atom';

type World = Context & { spawn<T>(operation: Operation<T>): Promise<T> };

const initialState: SimulationsState = {
  simulations: {},
};

describe('simulation', () => {
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

  describe('simulation', () => {
    describe('create simulation', () => {
      it('should retrieve simulation', async () => {
        const simulation = await simulationContext.createSimulation('test', 'gateway');

        const retrieved = simulationContext.atom.slice('simulations', simulation.uuid, 'simulation').get();

        expect(retrieved.simulators['gateway'].uuid).toBeTruthy();
      });
    });

    describe('simulation events', () => {
      describe('SIMULATION_CREATED', () => {
        let simulationID: string;
        let subscription: Subscription<StateEvents>;

        beforeEach(async () => {
          subscription = await currentWorld.spawn(subscribe(statePublisher));
          const { uuid } = await simulationContext.createSimulation('test', 'gateway');
          simulationID = uuid;
        });

        it('should receive SIMULATION_CREATED event', async () => {
          const event = (await (await currentWorld.spawn(subscription.next())).value) as SimulationEvents;

          assert(event.kind === 'SIMULATION_CREATED', `wrong event kind ${event.kind}`);

          expect(event.simulation.uuid).toBe(simulationID);
        });
      });
    });

    type User = { id: string; firstName: string; lastName: string; dateOfBirth: Date };

    describe('create thing', () => {
      let thing: Thing<User>;
      let result: { uuid: string; name?: string };

      beforeEach(async () => {
        result = await simulationContext.createSimulation('test', 'gateway');

        thing = simulationContext.create<User>({
          simulationID: result.uuid,
          kind: 'User',
          simulator: 'gateway',
        }).attributes;
      });

      it('should create a thing in the simulation store', () => {
        const simulator = Object.values(simulationContext.atom.slice('simulations', result.uuid, 'simulators').get())[0]
          .simulator;

        const user = simulationContext.atom
          .slice('simulations', result.uuid, 'simulators', simulator.uuid, 'things', thing.uuid)
          .get();

        expect(typeof user.value.firstName === 'string' && typeof user.value.firstName === 'string').toBe(true);
      });

      it('should create user in vendor simulator', () => {
        const simulation = simulationContext.atom.slice('simulations', result.uuid, 'simulation').get();

        expect(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          simulation.simulators.gateway.store?.getBy('users', (user: any) => {
            return thing.value.firstName === user.firstName && thing.value.lastName === user.lastName;
          }),
        ).toBeTruthy();
      });
    });

    describe('should propagate new data across simulators', () => {
      let thing: Thing<Authh0Types>;
      let result: { uuid: string; name?: string };
      let subscription: Subscription<StateEvents>;

      beforeEach(async () => {
        subscription = await currentWorld.spawn(subscribe(statePublisher));

        result = await simulationContext.createSimulation('test', ['auth0', 'gateway']);

        const simulation = simulationContext.atom.slice('simulations', result.uuid, 'simulation').get();

        // preconditions
        const auth0Store = simulation.simulators.auth0.store;
        const usersStore = simulation.simulators.gateway.store;
        usersStore?.clear();
        auth0Store?.clear();

        assert(auth0Store?.getAll()?.length === 0, `too many records in auth0 ${auth0Store?.getAll()?.length}`);
        assert(usersStore?.getAll()?.length === 0, `too many records in gateway ${usersStore?.getAll()?.length}`);

        thing = simulationContext.create<Authh0Types>({
          simulationID: result.uuid,
          kind: 'Token',
          simulator: 'auth0',
        }).attributes;
      });

      it('should create thing in simulation store', () => {
        const simulatorSlice = simulationContext.atom.slice('simulations', result.uuid, 'simulators');

        const simulator = Object.values(simulatorSlice.get())[0].simulator;

        const token: Thing<Authh0Types> = simulatorSlice.slice(simulator.uuid, 'things', thing.uuid).get();

        expect(token.value.email).toBe(thing.value.email);
      });

      it('should create user in vendor simulator', async () => {
        await subscription.next();
        await subscription.next();
        const simulation = simulationContext.atom.slice('simulations', result.uuid, 'simulation').get();

        expect(simulation.simulators.auth0.store?.getAll()).toHaveLength(1);

        expect(simulation.simulators.gateway.store?.getAll()).toHaveLength(1);

        const token: { id: string; email: string } = simulation.simulators.auth0.store?.getAll()[0] as {
          id: string;
          email: string;
        };
        const user: { id: string; email: string } = simulation.simulators.gateway.store?.getAll()[0] as {
          id: string;
          email: string;
        };

        expect(user.email).toBe(token.email);
        expect(user.id).toBe(token.id);
      });
    });
  });
});
