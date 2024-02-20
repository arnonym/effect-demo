import { Api } from 'effect-http';
import { todoApiSpec } from './todo/api-spec';

export const apiSpec = Api.api({ title: 'API' }).pipe(Api.addGroup(todoApiSpec));
