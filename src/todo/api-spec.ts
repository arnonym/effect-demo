import { Api } from 'effect-http';
import * as Schema from '@effect/schema/Schema';
import { AddTodoSchemaApi, TodoSchemaApi } from './domain';

export const todoApiSpec = Api.apiGroup('Todos').pipe(
  Api.get('getTodos', '/todos', {
    response: Schema.array(TodoSchemaApi),
  }),
  Api.get('getTodoById', '/todos/:id', {
    request: { params: Schema.struct({ id: Schema.UUID }) },
    response: [
      { status: 200, content: TodoSchemaApi },
      { status: 404, content: Schema.string },
    ],
  }),
  Api.post('newTodo', '/todos', {
    request: { body: AddTodoSchemaApi },
    response: TodoSchemaApi,
  }),
  Api.delete('removeTodo', '/todos/:id', {
    request: { params: Schema.struct({ id: Schema.UUID }) },
    response: { status: 204, content: Schema.string },
  }),
);
