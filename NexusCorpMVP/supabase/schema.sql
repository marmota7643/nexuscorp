-- NexusCorp: ejecutar en el SQL Editor de Supabase antes de desplegar la función.
create table if not exists public.corporations (
    id uuid primary key default gen_random_uuid(),
    device_id uuid not null unique,
    company_name text not null default 'NEXUS CORP',
    save jsonb not null,
    admin_revision integer not null default 0,
    updated_at timestamptz not null default now()
);

alter table public.corporations enable row level security;
-- No se crean políticas públicas: únicamente la Edge Function (service_role) accede a esta tabla.
