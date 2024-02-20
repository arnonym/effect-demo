import * as Effect from 'effect/Effect';
import * as Sql from '@sqlfx/pg';

export default Effect.flatMap(
  Sql.tag,
  sql =>
    sql`
      CREATE TABLE "public"."todo" (
         "id" uuid NOT NULL,
         "description" text NOT NULL,
         "created_at" timestamptz,
         "finished_at" timestamptz
      );
    `,
);
