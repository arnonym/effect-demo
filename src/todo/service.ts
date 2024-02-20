import * as Effect from 'effect/Effect';
import { TodoRepo } from './repo';
import { AddTodo, Todo } from './domain';
import { Context } from 'effect';
import { PgClient } from '@sqlfx/pg';
import { Option } from 'effect/Option';
import { ResultLengthMismatch, SchemaError, SqlError } from '@sqlfx/sql/Error';

interface TodoServiceInterface {
  add: (
    todo: AddTodo,
  ) => Effect.Effect<Todo, SqlError | ResultLengthMismatch | SchemaError, TodoRepo | PgClient>;
  removeById: (id: string) => Effect.Effect<void, SqlError | SchemaError, TodoRepo | PgClient>;
  getById: (id: string) => Effect.Effect<Option<Todo>, SqlError | SchemaError, TodoRepo | PgClient>;
  getAll: () => Effect.Effect<readonly Todo[], SqlError | SchemaError, TodoRepo | PgClient>;
}

export class TodoService extends Context.Tag('TodoService')<TodoService, TodoServiceInterface>() {}

export const TodoServiceLive: TodoServiceInterface = {
  getById: (id: string) =>
    Effect.gen(function* (_) {
      const todo = yield* _(TodoRepo);
      return yield* _(todo.getById(id));
    }),

  getAll: () =>
    Effect.gen(function* (_) {
      const todo = yield* _(TodoRepo);
      return yield* _(todo.getAll());
    }),

  add: (newTodo: AddTodo) =>
    Effect.gen(function* (_) {
      const todo = yield* _(TodoRepo);
      return yield* _(todo.add(newTodo));
    }),

  removeById: (id: string) =>
    Effect.gen(function* (_) {
      const todo = yield* _(TodoRepo);
      return yield* _(todo.removeById(id));
    }),
};
