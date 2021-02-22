import { Slice } from '@bigtest/atom';
import { subscribe } from '@effection/subscription';
import { Context, Operation, spawn } from 'effection';

export function* map<A>(
  slice: Slice<Record<string, A>>,
  operation: (slice: Slice<A>, key: string) => Operation<void>,
): Operation<void> {
  const contexts = new Map<string, Context>();

  function* synchronize(record: Record<string, A>) {
    const keep = new Set<string>();

    for (const key of Object.keys(record)) {
      if (!contexts.has(key)) {
        contexts.set(key, yield spawn(operation(slice.slice(key), key)));
      }

      keep.add(key);
    }

    for (const [key, context] of contexts.entries()) {
      if (!keep.has(key)) {
        context.halt();
      }
    }
  }

  yield synchronize(slice.get());

  yield subscribe(slice).forEach(synchronize);
}
