-- Studio Luna: Row Level Security aanzetten op alle tabellen in het publieke schema.
--
-- Waarom dit veilig is voor de site: de website maakt verbinding via DATABASE_URL met
-- de rol "postgres", en die rol negeert Row Level Security. De site en het admin-paneel
-- blijven dus gewoon werken. Wat wel dichtgaat is de publieke Supabase API met de
-- anon-sleutel, en dat is precies waar Supabase over waarschuwt.
--
-- Gebruik: Supabase dashboard > SQL Editor > New query > dit hele bestand plakken > Run.

-- 1. RLS aan op elke tabel in het publieke schema.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- 2. Tweede slot op de deur: de publieke API-rollen krijgen helemaal geen rechten meer.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- 3. Controle. Elke regel hoort nu rowsecurity = true te tonen.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
