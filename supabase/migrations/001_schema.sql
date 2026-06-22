-- ============================================================
-- American Nails & Spa — Production Database Schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- LOCATIONS (multi-location ready)
-- ─────────────────────────────────────────────
create table locations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  address     text not null,
  city        text not null,
  state       text not null,
  zip         text not null,
  phone       text not null,
  email       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'customer' check (role in ('owner','admin','staff','customer')),
  first_name  text not null default '',
  last_name   text not null default '',
  phone       text,
  email       text not null,
  location_id uuid references locations(id),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'customer'));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────
-- EMPLOYEES
-- ─────────────────────────────────────────────
create table employees (
  id               uuid primary key default uuid_generate_v4(),
  profile_id       uuid references profiles(id),
  location_id      uuid not null references locations(id),
  display_name     text not null,
  role             text not null default 'Nail Technician',
  specialty        text,
  bio              text,
  years_experience int not null default 0,
  avatar_url       text,
  is_active        boolean not null default true,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- SERVICE CATEGORIES
-- ─────────────────────────────────────────────
create table service_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  sort_order  int not null default 0,
  is_active   boolean not null default true
);

-- ─────────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────────
create table services (
  id          uuid primary key default uuid_generate_v4(),
  category_id uuid not null references service_categories(id),
  location_id uuid not null references locations(id),
  name        text not null,
  description text,
  duration_min int not null default 60,
  price_min   numeric(8,2),
  price_max   numeric(8,2),
  image_url   text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────────
create table appointments (
  id               uuid primary key default uuid_generate_v4(),
  reference        text not null unique,
  location_id      uuid not null references locations(id),
  customer_id      uuid references profiles(id),
  employee_id      uuid references employees(id),
  service_id       uuid not null references services(id),
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','completed','cancelled','no_show')),
  appointment_date date not null,
  appointment_time time not null,
  duration_min     int not null default 60,
  first_name       text not null,
  last_name        text not null default '',
  phone            text not null,
  email            text,
  notes            text,
  source           text not null default 'online'
                     check (source in ('online','phone','walk_in','admin')),
  demo_mode        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- MESSAGES (concierge / contact form)
-- ─────────────────────────────────────────────
create table messages (
  id             uuid primary key default uuid_generate_v4(),
  location_id    uuid not null references locations(id),
  reference      text not null unique,
  name           text not null,
  phone          text not null,
  email          text,
  preferred_date date,
  preferred_time time,
  message        text not null,
  status         text not null default 'new'
                   check (status in ('new','read','contacted','booked','closed')),
  source         text not null default 'concierge'
                   check (source in ('concierge','contact_form','website')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- NEWSLETTER SUBSCRIBERS
-- ─────────────────────────────────────────────
create table newsletter_subscribers (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null,
  location_id uuid not null references locations(id),
  status      text not null default 'active' check (status in ('active','unsubscribed')),
  created_at  timestamptz not null default now(),
  unique (email, location_id)
);

-- ─────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────
create table reviews (
  id            uuid primary key default uuid_generate_v4(),
  location_id   uuid not null references locations(id),
  customer_id   uuid references profiles(id),
  customer_name text not null,
  rating        int not null check (rating between 1 and 5),
  text          text not null,
  service_name  text,
  source        text not null default 'internal'
                  check (source in ('google','internal','demo')),
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- GALLERY
-- ─────────────────────────────────────────────
create table gallery (
  id          uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id),
  image_url   text not null,
  alt_text    text not null,
  service_id  uuid references services(id),
  is_featured boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- REWARD POINTS
-- ─────────────────────────────────────────────
create table reward_points (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid not null references profiles(id) unique,
  balance         int not null default 0 check (balance >= 0),
  lifetime_earned int not null default 0,
  updated_at      timestamptz not null default now()
);

create table reward_history (
  id             uuid primary key default uuid_generate_v4(),
  customer_id    uuid not null references profiles(id),
  appointment_id uuid references appointments(id),
  points         int not null,
  type           text not null check (type in ('earned','redeemed','bonus','expired','adjusted')),
  description    text not null,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- MEMBERSHIPS
-- ─────────────────────────────────────────────
create table memberships (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  price_monthly   numeric(8,2) not null,
  benefits        jsonb not null default '[]',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- COUPONS
-- ─────────────────────────────────────────────
create table coupons (
  id             uuid primary key default uuid_generate_v4(),
  location_id    uuid not null references locations(id),
  code           text not null unique,
  description    text not null,
  discount_type  text not null check (discount_type in ('percent','fixed')),
  discount_value numeric(8,2) not null,
  min_spend      numeric(8,2),
  max_uses       int,
  uses_count     int not null default 0,
  expires_at     timestamptz,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- GIFT CARDS
-- ─────────────────────────────────────────────
create table gift_cards (
  id               uuid primary key default uuid_generate_v4(),
  code             text not null unique,
  initial_balance  numeric(8,2) not null,
  current_balance  numeric(8,2) not null,
  purchaser_email  text,
  recipient_email  text,
  is_active        boolean not null default true,
  expires_at       timestamptz,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- SUPPLIERS
-- ─────────────────────────────────────────────
create table suppliers (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  contact_name text,
  email        text,
  phone        text,
  website      text,
  notes        text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- INVENTORY
-- ─────────────────────────────────────────────
create table inventory (
  id               uuid primary key default uuid_generate_v4(),
  location_id      uuid not null references locations(id),
  supplier_id      uuid references suppliers(id),
  name             text not null,
  sku              text,
  barcode          text,
  category         text not null,
  purchase_price   numeric(8,2),
  retail_price     numeric(8,2),
  current_qty      int not null default 0 check (current_qty >= 0),
  min_qty          int not null default 5,
  storage_location text,
  expiration_date  date,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- PURCHASE ORDERS
-- ─────────────────────────────────────────────
create table purchase_orders (
  id           uuid primary key default uuid_generate_v4(),
  location_id  uuid not null references locations(id),
  supplier_id  uuid not null references suppliers(id),
  reference    text not null unique,
  status       text not null default 'draft'
                 check (status in ('draft','pending','approved','ordered','partially_received','received','cancelled')),
  notes        text,
  total_amount numeric(10,2) not null default 0,
  ordered_at   timestamptz,
  expected_at  date,
  received_at  timestamptz,
  created_by   uuid references profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table purchase_order_items (
  id                uuid primary key default uuid_generate_v4(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  inventory_id      uuid not null references inventory(id),
  qty_ordered       int not null check (qty_ordered > 0),
  qty_received      int not null default 0 check (qty_received >= 0),
  unit_price        numeric(8,2) not null
);

-- ─────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────
create table audit_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id),
  action     text not null,
  table_name text not null,
  record_id  uuid,
  old_data   jsonb,
  new_data   jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- SETTINGS (key-value per location)
-- ─────────────────────────────────────────────
create table settings (
  id          uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id),
  key         text not null,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  unique (location_id, key)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
create index on appointments (location_id, appointment_date);
create index on appointments (customer_id);
create index on appointments (status);
create index on appointments (reference);
create index on messages (location_id, status);
create index on messages (reference);
create index on inventory (location_id, current_qty);
create index on audit_logs (user_id, created_at desc);
create index on reward_history (customer_id, created_at desc);

-- ─────────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_profiles_updated   before update on profiles   for each row execute function set_updated_at();
create trigger trg_appts_updated      before update on appointments for each row execute function set_updated_at();
create trigger trg_messages_updated   before update on messages    for each row execute function set_updated_at();
create trigger trg_inventory_updated  before update on inventory   for each row execute function set_updated_at();
create trigger trg_po_updated         before update on purchase_orders for each row execute function set_updated_at();
create trigger trg_settings_updated   before update on settings    for each row execute function set_updated_at();
