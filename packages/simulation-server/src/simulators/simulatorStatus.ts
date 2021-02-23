import { Simulator, SimulatorTags } from '../types';

export const simulatorStatus = <S extends SimulatorTags>(simulator: Simulator<S>): string => {
  switch (simulator.status.kind) {
    case 'IDLE':
      return 'not running';
    case 'RUNNING':
      return `The ${simulator.tag} is running on ${simulator.status.url}`;
    case 'ERROR':
      return `The ${simulator.tag} crashed with ${simulator.status.error}`;
  }
};
