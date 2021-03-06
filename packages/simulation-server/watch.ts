import type { Operation } from 'effection';
import type { Process } from '@effection/node';
import { main, exec, daemon, StdIO } from '@effection/node';
import { subscribe, Subscription } from '@effection/subscription';
import type { Channel } from '@effection/channel';
import { spawn, timeout } from 'effection';
import { on } from '@effection/events';
import { watch } from 'chokidar';
import { Context } from 'vm';

main(function* () {
  const watcher = watch('./src/**/*.ts', { ignoreInitial: true });
  try {
    let process: Context = yield spawn(buildAndRun(500));

    const events: Subscription<[string]> = yield on(watcher, 'all');

    while (true) {
      const next: IteratorResult<[string]> = yield events.next();

      if (next.done) {
        break;
      } else {
        console.log('buidling.....');
        process.halt();
        process = yield spawn(buildAndRun(100));
      }
    }
  } finally {
    watcher.close();
  }
});

function writeOut(channel: Channel<string>, out: NodeJS.WriteStream) {
  return subscribe(channel).forEach(function (data) {
    return new Promise((resolve, reject) => {
      out.write(data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

function* executeAndOut(command: string): Operation<Context> {
  const p: Process = yield exec(`yarn ${command}`);
  yield spawn(writeOut(p.stdout, process.stdout));
  yield spawn(writeOut(p.stderr, process.stderr));
  yield p.expect();
}

function* buildAndRun(delay = 0): Operation<Context> {
  try {
    yield executeAndOut('clean');
    yield executeAndOut('generate');
    yield timeout(delay);
    const server: StdIO = yield daemon('node dist/server/server.js');
    yield spawn(writeOut(server.stdout, process.stdout));
    yield spawn(writeOut(server.stderr, process.stderr));
  } catch (err) {
    console.error(err);
  }

  yield;
}
