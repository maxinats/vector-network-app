-- Run this in Supabase SQL editor.
-- Table: onboarding applications and approved member profiles.

create table if not exists public.member_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  contact text not null,
  country text not null,
  role_title text,
  about text not null,
  building text,
  looking_for text,
  website text,
  twitter text,
  linkedin text,
  review_status text not null default 'pending',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint member_profiles_review_status_check
    check (review_status in ('pending', 'approved', 'rejected'))
);

create or replace function public.set_member_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists member_profiles_set_updated_at on public.member_profiles;
create trigger member_profiles_set_updated_at
before update on public.member_profiles
for each row
execute function public.set_member_profiles_updated_at();

alter table public.member_profiles enable row level security;

drop policy if exists "Users can read own profile" on public.member_profiles;
create policy "Users can read own profile"
on public.member_profiles
for select
to authenticated
using (id = auth.uid());

create or replace function public.is_current_user_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.member_profiles as me
    where me.id = auth.uid()
      and me.review_status = 'approved'
  );
$$;

drop policy if exists "Approved members can read approved profiles" on public.member_profiles;
create policy "Approved members can read approved profiles"
on public.member_profiles
for select
to authenticated
using (
  review_status = 'approved'
  and public.is_current_user_approved()
);

drop policy if exists "Users can insert own profile as pending" on public.member_profiles;
create policy "Users can insert own profile as pending"
on public.member_profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and review_status = 'pending'
);

drop policy if exists "Users can update own profile only to pending" on public.member_profiles;
create policy "Users can update own profile only to pending"
on public.member_profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and review_status = 'pending'
);
