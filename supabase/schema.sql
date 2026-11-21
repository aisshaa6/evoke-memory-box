-- Evoke: Supabase schema (memories + journal). Ad və avatar auth user_metadata-da saxlanır.
-- Hər istifadəçi yalnız öz datasını görür (Row Level Security).

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  date date,
  note text,
  photo_path text,      -- Storage: memories/<user_id>/<id>.jpg
  audio_path text,      -- Storage: memories/<user_id>/<id>.webm
  location text,
  tags text[] default '{}',
  is_favorite boolean default false,
  created_at timestamptz default now()
);

create table public.journal_entries (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date_key date not null,
  content text,
  updated_at timestamptz default now(),
  primary key (user_id, date_key)
);

alter table public.memories enable row level security;
alter table public.journal_entries enable row level security;

create policy "own memories" on public.memories for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own journal" on public.journal_entries for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Storage bucket (private): foto və audio üçün
insert into storage.buckets (id, name, public) values ('memories', 'memories', false);
create policy "own files" on storage.objects for all
  using (bucket_id = 'memories' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'memories' and (storage.foldername(name))[1] = auth.uid()::text);
