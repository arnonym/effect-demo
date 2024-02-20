import * as Schema from '@effect/schema/Schema';
import { identifier } from '@effect/schema/Schema';

export const TodoSchemaDb = Schema.struct({
  id: Schema.UUID,
  description: Schema.string,
  createdAt: Schema.DateFromSelf,
  finishedAt: Schema.nullable(Schema.DateFromSelf),
});

export const TodoSchemaApi = TodoSchemaDb.pipe(
  Schema.omit('createdAt', 'finishedAt'),
  Schema.extend(
    Schema.struct({
      createdAt: Schema.DateFromString,
      finishedAt: Schema.nullable(Schema.DateFromString),
    }),
  ),
  identifier('Todo'),
);

// TODO convert Schema.DateFromSelf to DateFromString?

export const AddTodoSchemaApi = TodoSchemaApi.pipe(
  Schema.omit('id', 'createdAt', 'finishedAt'),
  identifier('AddTodo'),
);

export type Todo = Schema.Schema.To<typeof TodoSchemaApi>;
export type AddTodo = Schema.Schema.To<typeof AddTodoSchemaApi>;
