-- Run this in Supabase SQL Editor after the initial schema
-- RPC function to safely increment user XP

create or replace function public.increment_xp(p_user_id uuid, p_amount int)
returns void language plpgsql security definer as $$
begin
  update public.users
  set total_xp = total_xp + p_amount
  where id = p_user_id;
end;
$$;

-- RPC function to update streak
create or replace function public.update_streak(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_last_date  date;
  v_streak     int;
  v_today      date := current_date;
begin
  select last_study_date, streak_count
  into v_last_date, v_streak
  from public.users
  where id = p_user_id;

  if v_last_date is null then
    update public.users
    set streak_count = 1, last_study_date = v_today
    where id = p_user_id;
  elsif v_last_date = v_today then
    -- Already studied today, no change
    null;
  elsif v_last_date = v_today - 1 then
    -- Consecutive day
    update public.users
    set streak_count = streak_count + 1, last_study_date = v_today
    where id = p_user_id;
  else
    -- Streak broken
    update public.users
    set streak_count = 1, last_study_date = v_today
    where id = p_user_id;
  end if;
end;
$$;
