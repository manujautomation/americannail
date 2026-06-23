-- Run this in Supabase SQL Editor once

create or replace function increment_reward_points(p_customer_id uuid, p_amount int)
returns void language sql security definer as $$
  insert into reward_points (customer_id, balance, lifetime_earned)
    values (p_customer_id, p_amount, p_amount)
  on conflict (customer_id) do update
    set balance         = reward_points.balance + p_amount,
        lifetime_earned = reward_points.lifetime_earned + p_amount,
        updated_at      = now();
$$;

create or replace function decrement_reward_points(p_customer_id uuid, p_amount int)
returns void language sql security definer as $$
  update reward_points
    set balance    = greatest(balance - p_amount, 0),
        updated_at = now()
  where customer_id = p_customer_id;
$$;
