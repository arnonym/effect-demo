CREATE TABLE public.sqlfx_migrations (
    migration_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL
);

CREATE TABLE public.todo (
    id uuid NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone,
    finished_at timestamp with time zone
);

ALTER TABLE ONLY public.sqlfx_migrations
    ADD CONSTRAINT sqlfx_migrations_pkey PRIMARY KEY (migration_id);

INSERT INTO public.sqlfx_migrations (migration_id, created_at, name) VALUES (1, '2024-02-20 18:05:41.723495+00', 'create_todo');