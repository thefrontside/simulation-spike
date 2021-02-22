import type { Database } from '../db/database';
import type { Context } from './types';

export function createContext(db: Database): Context {
  return {
    db,
  };
}
