-- Apply to the PUBLIC WEBSITE's Supabase project, not the agency's internal client system.
-- Only the server's service role may mutate credits or call these functions.
create table if not exists public.free_audits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('running', 'failed', 'completed')),
  job_id uuid not null,
  lease_until timestamptz,
  report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'completed' and report is not null) or status <> 'completed')
);
alter table public.free_audits enable row level security;
revoke all on public.free_audits from public, anon, authenticated;
grant select, insert, update on public.free_audits to service_role;

create or replace function public.claim_free_audit(p_user_id uuid, p_job_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_row public.free_audits%rowtype;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  if not exists (select 1 from auth.users where id = p_user_id and email_confirmed_at is not null and email is not null and not coalesce(is_anonymous, false)) then
    raise exception 'Verified user required';
  end if;
  select * into current_row from public.free_audits where user_id = p_user_id for update;
  if found and current_row.status = 'completed' then
    return jsonb_build_object('state', 'completed', 'report', current_row.report);
  end if;
  if found and current_row.status = 'running' and current_row.lease_until > now() then
    return jsonb_build_object('state', 'running');
  end if;
  insert into public.free_audits (user_id, status, job_id, lease_until)
  values (p_user_id, 'running', p_job_id, now() + interval '2 minutes')
  on conflict (user_id) do update set status = 'running', job_id = excluded.job_id, lease_until = excluded.lease_until, report = null, updated_at = now();
  return jsonb_build_object('state', 'claimed');
end; $$;

create or replace function public.complete_free_audit(p_user_id uuid, p_job_id uuid, p_report jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare updated_count integer;
begin
  if jsonb_typeof(p_report) is distinct from 'object' or jsonb_typeof(p_report->'findings') is distinct from 'array' or octet_length(p_report::text) > 100000 then
    raise exception 'Invalid report';
  end if;
  update public.free_audits set status = 'completed', report = p_report, lease_until = null, updated_at = now()
  where user_id = p_user_id and job_id = p_job_id and status = 'running';
  get diagnostics updated_count = row_count;
  return updated_count = 1;
end; $$;

create or replace function public.fail_free_audit(p_user_id uuid, p_job_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare updated_count integer;
begin
  update public.free_audits set status = 'failed', lease_until = null, updated_at = now()
  where user_id = p_user_id and job_id = p_job_id and status = 'running';
  get diagnostics updated_count = row_count;
  return updated_count = 1;
end; $$;

revoke all on function public.claim_free_audit(uuid,uuid) from public, anon, authenticated;
revoke all on function public.complete_free_audit(uuid,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.fail_free_audit(uuid,uuid) from public, anon, authenticated;
grant execute on function public.claim_free_audit(uuid,uuid) to service_role;
grant execute on function public.complete_free_audit(uuid,uuid,jsonb) to service_role;
grant execute on function public.fail_free_audit(uuid,uuid) to service_role;
