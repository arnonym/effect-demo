import { pipe } from 'effect/Function';
import * as Config from 'effect/Config';
import * as Effect from 'effect/Effect';
import * as Pg from '@sqlfx/pg';
import { Layer, Secret } from 'effect';
import { RouterBuilder } from 'effect-http';
import { PrettyLogger } from 'effect-log';
import { runMain } from '@effect/platform-node/NodeRuntime';
import { NodeServer } from 'effect-http-node';
import { optionToNotFound, toNoContent } from './utils';
import { apiSpec } from './api-spec';
import { TodoService, TodoServiceLive } from './todo/service';
import * as Migrator from '@sqlfx/pg/Migrator';
import { TodoRepo, TodoRepoLive } from './todo/repo';
import { AddTodo } from './todo/domain';
import { fileURLToPath } from 'node:url';

const PgLive = Pg.makeLayer({
  host: Config.succeed('127.0.0.1'),
  port: Config.succeed(5432),
  username: Config.succeed('example'),
  database: Config.succeed('example'),
  password: Config.succeed(Secret.fromString('example')),
  transformQueryNames: Config.succeed(Pg.transform.camelToSnake),
  transformResultNames: Config.succeed(Pg.transform.snakeToCamel),
});

const getTodos = () =>
  Effect.gen(function* (_) {
    const ts = yield* _(TodoService);
    return yield* _(ts.getAll());
  });

const getTodoById = (id: string) =>
  Effect.gen(function* (_) {
    const ts = yield* _(TodoService);
    return yield* _(ts.getById(id));
  });

const newTodo = (todo: AddTodo) =>
  Effect.gen(function* (_) {
    const ts = yield* _(TodoService);
    return yield* _(ts.add(todo));
  });

const removeTodo = (id: string) =>
  Effect.gen(function* (_) {
    const ts = yield* _(TodoService);
    return yield* _(ts.removeById(id));
  });

const app = pipe(
  RouterBuilder.make(apiSpec),
  RouterBuilder.handle('getTodos', () => getTodos()),
  RouterBuilder.handle('getTodoById', ({ params }) => getTodoById(params.id).pipe(optionToNotFound)),
  RouterBuilder.handle('newTodo', ({ body }) => newTodo(body)),
  RouterBuilder.handle('removeTodo', ({ params }) => removeTodo(params.id).pipe(toNoContent)),
  RouterBuilder.build,
);

const migrationPath = fileURLToPath(new URL('migrations', import.meta.url));
const MigratorLive = Layer.provide(
  Migrator.makeLayer({
    schemaDirectory: 'src/migrations',
    loader: Migrator.fromDisk(migrationPath),
  }),
  PgLive,
);

const EnvLive = Layer.mergeAll(PgLive, MigratorLive);

app.pipe(
  Effect.tapErrorCause(Effect.logError),
  Effect.provideService(TodoRepo, TodoRepoLive),
  Effect.provideService(TodoService, TodoServiceLive),
  Effect.provide(EnvLive),
  NodeServer.listen({ port: 3000 }),
  Effect.provide(PrettyLogger.layer()),
  runMain,
);
