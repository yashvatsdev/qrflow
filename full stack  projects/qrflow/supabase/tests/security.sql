-- Non-destructive checks; safe to run against the dedicated QRFlow project.
begin;
do $$
begin
  if exists(select 1 from pg_tables where schemaname in ('public','private') and tablename in ('profiles','qr_codes','scan_events','scan_quotas','write_quotas') and not rowsecurity) then raise exception 'RLS missing'; end if;
  if has_table_privilege('anon','public.qr_codes','SELECT') or has_table_privilege('anon','public.scan_events','SELECT') then raise exception 'Anonymous table exposure'; end if;
  if has_column_privilege('authenticated','public.qr_codes','slug','UPDATE') or has_column_privilege('authenticated','public.qr_codes','user_id','UPDATE') then raise exception 'Identity fields mutable'; end if;
  if has_function_privilege('anon','public.scan_stats(uuid)','EXECUTE') or has_function_privilege('anon','public.record_scan(uuid)','EXECUTE') then raise exception 'Privileged function exposed'; end if;
  if (select count(*) from pg_policies where schemaname='public' and tablename='qr_codes' and (qual like '%auth.uid()%' or with_check like '%auth.uid()%')) <> 4 then raise exception 'Owner policies missing'; end if;
end $$;
set local role anon;
select public.resolve_public_qr('AAAAAAAAAAAAAAAAAAAAAA') is null as unknown_code_is_null;
select public.record_public_scan('not-valid');
reset role;
set local role authenticated;
select count(*) = 0 as no_session_cannot_read_codes from public.qr_codes;
select (public.scan_stats()->>'total')::integer = 0 as no_session_has_no_analytics;
reset role;
rollback;
