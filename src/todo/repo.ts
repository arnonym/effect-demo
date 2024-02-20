import * as Effect from 'effect/Effect';
import * as Pg from '@sqlfx/pg';
import { PgClient } from '@sqlfx/pg';
import { AddTodo, TodoSchemaDb, Todo } from './domain';
import { v4 as uuid } from 'uuid';
import * as Schema from '@effect/schema/Schema';
import { Context } from 'effect';
import { ResultLengthMismatch, SchemaError, SqlError } from '@sqlfx/sql/Error';
import { Option } from 'effect/Option';

interface TodoRepoInterface {
  add: (todo: AddTodo) => Effect.Effect<Todo, SqlError | ResultLengthMismatch | SchemaError, PgClient>;
  removeById: (id: string) => Effect.Effect<void, SqlError | SchemaError, PgClient>;
  getById: (id: string) => Effect.Effect<Option<Todo>, SqlError | SchemaError, PgClient>;
  getAll: () => Effect.Effect<readonly Todo[], SqlError | SchemaError, PgClient>;
}

export class TodoRepo extends Context.Tag('TodoRepo')<TodoRepo, TodoRepoInterface>() {}

export const TodoRepoLive: TodoRepoInterface = {
  add: (todo: AddTodo) =>
    Effect.gen(function* (_) {
      const sql = yield* _(Pg.tag);
      const insertResolver = sql.resolver('InsertTodo', {
        request: TodoSchemaDb,
        result: TodoSchemaDb,
        run: requests => sql`INSERT INTO todo ${sql.insert(requests)} RETURNING todo.*`,
      }).execute;
      const data = {
        id: uuid(),
        description: todo.description,
        createdAt: new Date(),
        finishedAt: null,
      };
      return yield* _(insertResolver(data));
    }),

  removeById: (id: string) =>
    Effect.gen(function* (_) {
      const sql = yield* _(Pg.tag);
      const removeByIdResolver = sql.resolverVoid('RemoveTodoById', {
        request: Schema.UUID,
        run: id => sql`DELETE FROM todo WHERE id=${sql(id)}`,
      });
      return yield* _(removeByIdResolver.execute(id));
    }),

  getById: (id: string) =>
    Effect.gen(function* (_) {
      const sql = yield* _(Pg.tag);
      const getByIdResolver = sql.resolverId('GetTodoById', {
        id: Schema.UUID,
        result: TodoSchemaDb,
        resultId: _ => _.id,
        run: ids => sql`SELECT * FROM todo WHERE id IN ${sql(ids)}`,
      });
      return yield* _(getByIdResolver.execute(id));
    }),

  getAll: () =>
    Effect.gen(function* (_) {
      const sql = yield* _(Pg.tag);
      return yield* _(sql<Todo>`SELECT * FROM todo`);
    }),
};
