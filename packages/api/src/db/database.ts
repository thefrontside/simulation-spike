import { GraphQLObjectType } from 'graphql';
import * as uuid from 'uuid';
import dayjs from 'dayjs';

type ModelKeys = keyof Database['data'];

type Models = User;

type IdGenerator = () => string;

export type Database = {
  data: {
    users: User[];
  };
  idGenerator: IdGenerator;
  clear(): void;
  get(type: ModelKeys, id: string): Models | undefined;
  getBy<S extends (args: unknown[]) => Models | undefined>(type: ModelKeys, selector: S): Models | undefined;
  getAll(): Models[];
  create(type: GraphQLObjectType, input: Omit<User, 'id'>): User;
  // new (idGenerator: IdGenerator): Database;
};

export type User = {
  readonly id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
};

export class DB implements Database {
  data: { users: User[] };

  constructor(public idGenerator: IdGenerator) {
    this.data = { users: [] };
  }

  clear(): void {
    this.data.users = [];
  }

  get(type: ModelKeys, id: string): Models | undefined {
    return this.data[type].find((u) => u.id === id);
  }

  getBy<S extends (args: unknown[]) => Models | undefined>(type: ModelKeys, selector: S): Models | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.data[type].find(selector as any);
  }

  getAll(): Models[] {
    return this.data.users;
  }

  create(type: GraphQLObjectType, input: Omit<User, 'id'> & { id?: string }): User {
    const id = input.id ?? this.idGenerator();
    const user = { ...input, id } as User;
    this.data.users.push(user);
    return user;
  }
}

export const db = new DB(() => uuid.v4());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
db.create(undefined as any, {
  email: 'bob@hughes.io',
  firstName: 'bob',
  lastName: 'hughes',
  phone: '013010101',
  createdAt: dayjs().subtract(20, 'days').toDate(),
  updatedAt: dayjs().subtract(10, 'days').toDate(),
});
