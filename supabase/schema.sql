-- Rode este script uma vez no Supabase: SQL Editor -> New query -> colar -> Run

create table if not exists public.orders (
  id text primary key,
  number bigint generated always as identity (start with 1001),
  customer_name text not null,
  customer_email text,
  fulfillment text not null,
  address text,
  payment text not null,
  change_for text,
  items jsonb not null,
  subtotal numeric not null,
  status text not null default 'novo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key,
  name text not null,
  email text not null unique,
  picture text,
  provider text not null default 'google',
  first_visit_at timestamptz not null default now(),
  last_login_at timestamptz not null default now(),
  login_count integer not null default 1
);

-- Bloqueia acesso público direto; o site acessa pelo servidor com a service role key.
alter table public.orders enable row level security;
alter table public.customers enable row level security;

-- Libera as tabelas apenas para a service role (usada pelo servidor do site).
grant usage on schema public to service_role;
grant select, insert, update, delete on public.orders, public.customers to service_role;
