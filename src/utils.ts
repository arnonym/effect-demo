import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';

export const optionToNotFound = <A, E, R>(e: Effect.Effect<Option.Option<A>, E, R>) =>
  e.pipe(
    Effect.map(Option.map(r => ({ status: 200 as const, content: r }))),
    Effect.map(Option.getOrElse(() => ({ status: 404 as const, content: 'Not found' }))),
  );

export const toNoContent = <A, E, R>(e: Effect.Effect<A, E, R>) =>
  e.pipe(Effect.map(_ => ({ status: 204 as const, content: '' })));
