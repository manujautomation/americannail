-- ============================================================
-- Row Level Security Policies
-- Run AFTER 001_schema.sql
-- ============================================================

alter table locations            enable row level security;
alter table profiles             enable row level security;
alter table employees            enable row level security;
alter table service_categories   enable row level security;
alter table services             enable row level security;
alter table appointments         enable row level security;
alter table messages             enable row level security;
alter table newsletter_subscribers enable row level security;
alter table reviews              enable row level security;
alter table gallery              enable row level security;
alter table reward_points        enable row level security;
alter table reward_history       enable row level security;
alter table memberships          enable row level security;
alter table coupons              enable row level security;
alter table gift_cards           enable row level security;
alter table suppliers            enable row level security;
alter table inventory            enable row level security;
alter table purchase_orders      enable row level security;
alter table purchase_order_items enable row level security;
alter table audit_logs           enable row level security;
alter table settings             enable row level security;

-- Helper: get current user role
create or replace function get_my_role()
returns text language sql security definer stable as $$
  select role from profiles where id = auth.uid();
$$;

-- Helper: is staff or above
create or replace function is_staff()
returns boolean language sql security definer stable as $$
  select get_my_role() in ('owner','admin','staff');
$$;

-- Helper: is admin or owner
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select get_my_role() in ('owner','admin');
$$;

-- ─── LOCATIONS ───────────────────────────────
-- Public read, admin write
create policy "locations_public_read"  on locations for select using (true);
create policy "locations_admin_write"  on locations for all    using (is_admin());

-- ─── PROFILES ────────────────────────────────
-- Users see/edit own profile; staff see all
create policy "profiles_own_read"   on profiles for select using (auth.uid() = id or is_staff());
create policy "profiles_own_update" on profiles for update using (auth.uid() = id);
create policy "profiles_admin_all"  on profiles for all    using (is_admin());

-- ─── EMPLOYEES ───────────────────────────────
-- Public read; admin write
create policy "employees_public_read" on employees for select using (is_active = true);
create policy "employees_admin_write" on employees for all   using (is_admin());

-- ─── SERVICE CATEGORIES ──────────────────────
create policy "svc_cat_public_read"  on service_categories for select using (is_active = true);
create policy "svc_cat_admin_write"  on service_categories for all    using (is_admin());

-- ─── SERVICES ────────────────────────────────
create policy "services_public_read" on services for select using (is_active = true);
create policy "services_admin_write" on services for all    using (is_admin());

-- ─── APPOINTMENTS ────────────────────────────
-- Customers see own; staff see all
create policy "appts_customer_read"  on appointments for select
  using (customer_id = auth.uid() or is_staff());
create policy "appts_insert_anon"    on appointments for insert
  with check (true); -- allow anonymous booking (demo + production)
create policy "appts_staff_update"   on appointments for update
  using (is_staff());
create policy "appts_admin_delete"   on appointments for delete
  using (is_admin());

-- ─── MESSAGES ────────────────────────────────
create policy "messages_insert_anon" on messages for insert with check (true);
create policy "messages_staff_read"  on messages for select using (is_staff());
create policy "messages_staff_update" on messages for update using (is_staff());

-- ─── NEWSLETTER ──────────────────────────────
create policy "newsletter_insert_anon" on newsletter_subscribers for insert with check (true);
create policy "newsletter_admin_read"  on newsletter_subscribers for select using (is_admin());

-- ─── REVIEWS ─────────────────────────────────
create policy "reviews_public_read"  on reviews for select using (true);
create policy "reviews_admin_write"  on reviews for all    using (is_admin());

-- ─── GALLERY ─────────────────────────────────
create policy "gallery_public_read"  on gallery for select using (true);
create policy "gallery_admin_write"  on gallery for all    using (is_admin());

-- ─── REWARD POINTS ───────────────────────────
create policy "rewards_own_read"    on reward_points for select using (customer_id = auth.uid() or is_staff());
create policy "rewards_staff_write" on reward_points for all    using (is_staff());

create policy "reward_history_own"  on reward_history for select using (customer_id = auth.uid() or is_staff());
create policy "reward_history_staff" on reward_history for insert using (is_staff());

-- ─── MEMBERSHIPS ─────────────────────────────
create policy "memberships_public_read" on memberships for select using (is_active = true);
create policy "memberships_admin_write" on memberships for all    using (is_admin());

-- ─── COUPONS ─────────────────────────────────
-- Customers can read active coupons; only admin writes
create policy "coupons_public_read"  on coupons for select using (is_active = true);
create policy "coupons_admin_write"  on coupons for all    using (is_admin());

-- ─── GIFT CARDS ──────────────────────────────
create policy "gift_cards_admin_all" on gift_cards for all using (is_admin());

-- ─── SUPPLIERS ───────────────────────────────
create policy "suppliers_staff_read"  on suppliers for select using (is_staff());
create policy "suppliers_admin_write" on suppliers for all    using (is_admin());

-- ─── INVENTORY ───────────────────────────────
create policy "inventory_staff_read"  on inventory for select using (is_staff());
create policy "inventory_admin_write" on inventory for all    using (is_admin());

-- ─── PURCHASE ORDERS ─────────────────────────
create policy "po_staff_read"  on purchase_orders for select using (is_staff());
create policy "po_admin_write" on purchase_orders for all    using (is_admin());

create policy "po_items_staff_read"  on purchase_order_items for select using (is_staff());
create policy "po_items_admin_write" on purchase_order_items for all    using (is_admin());

-- ─── AUDIT LOGS ──────────────────────────────
create policy "audit_admin_read"  on audit_logs for select using (is_admin());
create policy "audit_insert_all"  on audit_logs for insert with check (true);

-- ─── SETTINGS ────────────────────────────────
create policy "settings_staff_read"  on settings for select using (is_staff());
create policy "settings_admin_write" on settings for all    using (is_admin());
