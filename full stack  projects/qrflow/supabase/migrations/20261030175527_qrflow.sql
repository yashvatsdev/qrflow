-- Apply only to the dedicated, verified QRFlow project.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique check (slug ~ '^[A-Za-z0-9_-]{22}$'),
  name text not null check (length(trim(name)) between 1 and 80),
  destination_url text not null check (length(destination_url) <= 2048 and destination_url ~ '^https?://'),
  status text not null default 'active' check (status in ('active','paused')),
  style_config jsonb not null default '{"foreground":"#0b0f14","background":"#ffffff","resolution":1024}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index qr_codes_owner_created on public.qr_codes(user_id,created_at desc);
create table public.scan_events (
  id uuid primary key default gen_random_uuid(),
  qr_code_id uuid not null references public.qr_codes(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  source_type text not null default 'redirect' check(source_type = 'redirect')
);
create index scan_events_code_time on public.scan_events(qr_code_id,scanned_at desc);
-- Private, bounded counters: no IP addresses or visitor fingerprints.
create table private.write_quotas (user_id uuid primary key references auth.users(id) on delete cascade, day date not null, writes integer not null);
create table private.scan_quotas (qr_code_id uuid primary key references public.qr_codes(id) on delete cascade, day date not null, scans integer not null);
alter table public.profiles enable row level security;
alter table public.qr_codes enable row level security;
alter table public.scan_events enable row level security;
alter table private.write_quotas enable row level security;
alter table private.scan_quotas enable row level security;
revoke all on public.profiles, public.qr_codes, public.scan_events from anon, authenticated;
grant select on public.profiles to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant select,delete on public.qr_codes to authenticated;
grant insert(user_id,slug,name,destination_url,status,style_config) on public.qr_codes to authenticated;
grant update(name,destination_url,status,style_config) on public.qr_codes to authenticated;
grant select on public.scan_events to authenticated;
grant all on public.profiles,public.qr_codes,public.scan_events to service_role;
create policy profile_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profile_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy qr_read on public.qr_codes for select to authenticated using(user_id=(select auth.uid()));
create policy qr_insert on public.qr_codes for insert to authenticated with check(user_id=(select auth.uid()));
create policy qr_update on public.qr_codes for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy qr_delete on public.qr_codes for delete to authenticated using(user_id=(select auth.uid()));
create policy scans_owner on public.scan_events for select to authenticated using(exists(select 1 from public.qr_codes q where q.id=qr_code_id and q.user_id=(select auth.uid())));

create function private.new_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,display_name,avatar_url) values(new.id,left(coalesce(new.raw_user_meta_data->>'full_name','QRFlow member'),100),new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;
revoke all on function private.new_profile() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.new_profile();
insert into public.profiles(id,display_name,avatar_url) select id,left(coalesce(raw_user_meta_data->>'full_name','QRFlow member'),100),raw_user_meta_data->>'avatar_url' from auth.users on conflict(id) do nothing;

create function private.guard_qr_write() returns trigger language plpgsql security definer set search_path='' as $$
declare owner_id uuid; n integer;
begin
  owner_id:=case when TG_OP='DELETE' then old.user_id else new.user_id end;
  if auth.uid() is null or auth.uid()<>owner_id then raise exception 'Unauthorized' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text,0));
  if TG_OP='INSERT' and (select count(*) from public.qr_codes where user_id=owner_id)>=100 then raise exception 'QR quota exceeded'; end if;
  insert into private.write_quotas(user_id,day,writes) values(owner_id,(now() at time zone 'UTC')::date,1)
  on conflict(user_id) do update set day=excluded.day,writes=case when write_quotas.day=excluded.day then write_quotas.writes+1 else 1 end returning writes into n;
  if n>100 then raise exception 'Daily write quota exceeded'; end if;
  if TG_OP='DELETE' then return old; end if;
  if TG_OP='UPDATE' and (new.slug<>old.slug or new.user_id<>old.user_id or new.id<>old.id) then raise exception 'Immutable identity' using errcode='42501'; end if;
  new.updated_at:=now();return new;
end $$;
revoke all on function private.guard_qr_write() from public,anon,authenticated;
create trigger guard_qr_write before insert or update or delete on public.qr_codes for each row execute function private.guard_qr_write();

-- Invoker function: RLS remains active, including for aggregate analytics.
create function public.scan_stats(code_id uuid default null) returns jsonb language sql stable security invoker set search_path='' as $$
  with owned as (select s.scanned_at from public.scan_events s join public.qr_codes q on q.id=s.qr_code_id where q.user_id=auth.uid() and (code_id is null or q.id=code_id)),
  days as (select generate_series((now() at time zone 'UTC')::date-29,(now() at time zone 'UTC')::date,'1 day')::date as day),
  daily as (select (scanned_at at time zone 'UTC')::date as day,count(*) as scans from owned where scanned_at>=((now() at time zone 'UTC')::date-29)::timestamp at time zone 'UTC' group by 1)
  select jsonb_build_object('total',(select count(*) from owned),'last7',(select count(*) from owned where scanned_at>=((now() at time zone 'UTC')::date-6)::timestamp at time zone 'UTC'),'last30',(select count(*) from owned where scanned_at>=((now() at time zone 'UTC')::date-29)::timestamp at time zone 'UTC'),'daily',(select jsonb_agg(jsonb_build_object('date',d.day,'scans',coalesce(a.scans,0)) order by d.day) from days d left join daily a using(day)));
$$;
revoke all on function public.scan_stats(uuid) from public,anon;
grant execute on function public.scan_stats(uuid) to authenticated;

-- Only the server's service_role can record a scan. One counter row per QR;
-- cap retained requests at 10,000 per code/day to bound automated scan abuse.
create function public.record_scan(code_id uuid) returns void language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
  insert into private.scan_quotas(qr_code_id,day,scans) values(code_id,(now() at time zone 'UTC')::date,1)
  on conflict(qr_code_id) do update set day=excluded.day,scans=case when scan_quotas.day=excluded.day then least(scan_quotas.scans+1,10001) else 1 end returning scans into n;
  if n<=10000 then insert into public.scan_events(qr_code_id) values(code_id); end if;
end $$;
revoke all on function public.record_scan(uuid) from public,anon,authenticated;
grant usage on schema private to service_role;
grant all on private.scan_quotas to service_role;
grant execute on function public.record_scan(uuid) to service_role;

-- Capability endpoints expose only a single public link's resolution, never tables,
-- owner identity, styles, or analytics. A 128-bit slug is required for either call.
create function public.resolve_public_qr(public_slug text) returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object('id',q.id,'status',q.status,'destination_url',q.destination_url)
  from public.qr_codes q where q.slug=public_slug and public_slug ~ '^[A-Za-z0-9_-]{22}$';
$$;
revoke all on function public.resolve_public_qr(text) from public;
grant execute on function public.resolve_public_qr(text) to anon,authenticated;
create function public.record_public_scan(public_slug text) returns void language plpgsql security definer set search_path='' as $$
declare resolved_id uuid;
begin
  if public_slug !~ '^[A-Za-z0-9_-]{22}$' then return; end if;
  select id into resolved_id from public.qr_codes where slug=public_slug and status='active';
  if resolved_id is null then return; end if;
  perform public.record_scan(resolved_id);
end $$;
revoke all on function public.record_public_scan(text) from public;
grant execute on function public.record_public_scan(text) to anon,authenticated;
