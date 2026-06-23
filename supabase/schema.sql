-- ============================================================
-- American Nails & Spa — Complete Database Schema
-- Run this entire file in Supabase SQL Editor (once)
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- HELPER FUNCTION: auto-update updated_at timestamp
-- ============================================================
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. LOCATIONS
-- ============================================================
create table if not exists locations (
  id          uuid primary key default gen_random_uuid(),
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

-- Seed the one real location
insert into locations (id, name, address, city, state, zip, phone, email)
values (
  '00000000-0000-0000-0000-000000000001',
  'American Nails & Spa',
  '640 Warrior Dr Ste 106',
  'Stephens City',
  'VA',
  '22655',
  '+15408682811',
  'manuj.automation.ssn@gmail.com'
) on conflict (id) do nothing;

-- ============================================================
-- 2. PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists profiles (
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

create trigger profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 3. EMPLOYEES (technicians)
-- ============================================================
create table if not exists employees (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid references profiles(id) on delete set null,
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

-- Seed 3 demo technicians
insert into employees (id, location_id, display_name, role, specialty, years_experience, sort_order) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Lily Chen',   'Lead Nail Technician', 'Nail Art & Acrylics',    6, 1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Sophie Tran', 'Spa Specialist',       'Pedicures & Massage',    4, 2),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Anna Kim',    'Color Expert',         'Gel & Dip Powder',       5, 3)
on conflict (id) do nothing;

-- ============================================================
-- 4. SERVICE CATEGORIES
-- ============================================================
create table if not exists service_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  sort_order  int not null default 0,
  is_active   boolean not null default true
);

insert into service_categories (id, name, sort_order) values
  ('20000000-0000-0000-0000-000000000001', 'Manicure',   1),
  ('20000000-0000-0000-0000-000000000002', 'Pedicure',   2),
  ('20000000-0000-0000-0000-000000000003', 'Spa',        3),
  ('20000000-0000-0000-0000-000000000004', 'Waxing',     4),
  ('20000000-0000-0000-0000-000000000005', 'Nail Art',   5)
on conflict (id) do nothing;

-- ============================================================
-- 5. SERVICES
-- ============================================================
create table if not exists services (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references service_categories(id),
  location_id  uuid not null references locations(id),
  name         text not null,
  description  text,
  duration_min int not null,
  price_min    numeric(8,2),
  price_max    numeric(8,2),
  image_url    text,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

insert into services (id, category_id, location_id, name, description, duration_min, price_min, price_max, sort_order) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Gel Manicure',    'Long-lasting glossy gel polish, chip-free for weeks.',                    50,  35, 55,  1),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Acrylic Nails',   'Durable custom acrylic enhancements to your desired shape and length.',   80,  45, 75,  2),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Dip Powder',      'Lightweight, odor-free powder for a natural look with superior strength.', 65, 40, 60,  3),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Spa Pedicure',    'Relaxing foot care ritual with exfoliation, massage, and nail care.',     65,  40, 60,  4),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Foot Massage',    'Stress-relieving therapeutic massage with premium spa products.',         40,  30, 45,  5),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Nail Art',        'Custom artistic designs and hand-painted personalized nail art.',         60,  15, 50,  6),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Waxing',          'Gentle facial and body waxing for smooth, long-lasting results.',         30,  12, 40,  7),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Spa Treatments',  'Full-service spa experiences combining multiple personalized treatments.', 90,  80, 130, 8)
on conflict (id) do nothing;

-- ============================================================
-- 6. APPOINTMENTS
-- ============================================================
create table if not exists appointments (
  id               uuid primary key default gen_random_uuid(),
  reference        text not null unique,
  location_id      uuid not null references locations(id),
  customer_id      uuid references profiles(id) on delete set null,
  employee_id      uuid references employees(id) on delete set null,
  service_id       uuid not null references services(id),
  status           text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled','no_show')),
  appointment_date date not null,
  appointment_time time not null,
  duration_min     int not null,
  first_name       text not null,
  last_name        text not null,
  phone            text not null,
  email            text,
  notes            text,
  source           text not null default 'online' check (source in ('online','phone','walk_in','admin')),
  demo_mode        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists appointments_date_idx       on appointments(appointment_date);
create index if not exists appointments_employee_idx   on appointments(employee_id, appointment_date);
create index if not exists appointments_customer_idx   on appointments(customer_id);
create index if not exists appointments_status_idx     on appointments(status);

create trigger appointments_updated_at
  before update on appointments
  for each row execute function handle_updated_at();

-- ============================================================
-- 7. MESSAGES (concierge / contact form)
-- ============================================================
create table if not exists messages (
  id             uuid primary key default gen_random_uuid(),
  location_id    uuid not null references locations(id),
  reference      text not null unique,
  name           text not null,
  phone          text not null,
  email          text,
  preferred_date date,
  preferred_time text,
  message        text not null,
  status         text not null default 'new' check (status in ('new','read','contacted','booked','closed')),
  source         text not null default 'website' check (source in ('concierge','contact_form','website')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger messages_updated_at
  before update on messages
  for each row execute function handle_updated_at();

-- ============================================================
-- 8. NEWSLETTER SUBSCRIBERS
-- ============================================================
create table if not exists newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  location_id uuid not null references locations(id),
  status      text not null default 'active' check (status in ('active','unsubscribed')),
  created_at  timestamptz not null default now(),
  unique(email, location_id)
);

-- ============================================================
-- 9. REVIEWS
-- ============================================================
create table if not exists reviews (
  id            uuid primary key default gen_random_uuid(),
  location_id   uuid not null references locations(id),
  customer_id   uuid references profiles(id) on delete set null,
  customer_name text not null,
  rating        int not null check (rating between 1 and 5),
  text          text not null,
  service_name  text,
  source        text not null default 'internal' check (source in ('google','internal','demo')),
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Seed 10 demo reviews
insert into reviews (location_id, customer_name, rating, text, service_name, source, is_featured) values
  ('00000000-0000-0000-0000-000000000001', 'Sarah M.',      5, 'Absolutely love this place! My gel manicure lasted over three weeks without chipping.',                          'Gel Manicure',  'demo', true),
  ('00000000-0000-0000-0000-000000000001', 'Jennifer L.',   5, 'Best pedicure I''ve ever had. The foot massage alone was worth it. My go-to spot!',                            'Spa Pedicure',  'demo', true),
  ('00000000-0000-0000-0000-000000000001', 'Maria R.',      4, 'Great nail art! They did exactly what I wanted from just a reference photo. Very detailed work.',               'Nail Art',      'demo', true),
  ('00000000-0000-0000-0000-000000000001', 'Ashley T.',     5, 'Came in for dip powder and I''m obsessed with the results. Anna is so talented and detail-oriented.',           'Dip Powder',    'demo', false),
  ('00000000-0000-0000-0000-000000000001', 'Rachel K.',     5, 'Sophie gave me the most relaxing pedicure. The spa package is absolutely worth every penny.',                   'Spa Treatments','demo', false),
  ('00000000-0000-0000-0000-000000000001', 'Brittany W.',   4, 'Love how they take their time and don''t rush. The salon is very clean and welcoming.',                        'Acrylic Nails', 'demo', false),
  ('00000000-0000-0000-0000-000000000001', 'Donna P.',      5, 'Lily did an amazing ombre design for me. Will definitely be requesting her every time!',                        'Nail Art',      'demo', false),
  ('00000000-0000-0000-0000-000000000001', 'Cynthia H.',    4, 'Very friendly staff and fair prices. My acrylics look perfect. Highly recommend for anyone in the area.',       'Acrylic Nails', 'demo', false),
  ('00000000-0000-0000-0000-000000000001', 'Tiffany S.',    5, 'Walk-in was easy and I barely waited. The waxing was super clean and fast. Great experience overall.',          'Waxing',        'demo', false),
  ('00000000-0000-0000-0000-000000000001', 'Nicole B.',     5, 'They remembered my name on my second visit. That kind of personal touch keeps me coming back every month.',     'Gel Manicure',  'demo', true);

-- ============================================================
-- 10. GALLERY
-- ============================================================
create table if not exists gallery (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id),
  image_url   text not null,
  alt_text    text not null,
  service_id  uuid references services(id) on delete set null,
  is_featured boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

insert into gallery (location_id, image_url, alt_text, service_id, is_featured, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=85', 'Personalized gel manicure with rose gold accents', '30000000-0000-0000-0000-000000000001', true,  1),
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=800&q=85', 'Custom acrylic nail art design',                  '30000000-0000-0000-0000-000000000002', true,  2),
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=85', 'Elegant dip powder nails',                        '30000000-0000-0000-0000-000000000003', true,  3),
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&q=85', 'Relaxing spa pedicure treatment',                 '30000000-0000-0000-0000-000000000004', true,  4),
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=85', 'Premium spa treatment experience',                '30000000-0000-0000-0000-000000000008', true,  5),
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=85', 'Professional waxing services',                    '30000000-0000-0000-0000-000000000007', false, 6),
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=85', 'Therapeutic foot massage',                          '30000000-0000-0000-0000-000000000005', false, 7),
  ('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=85', 'Elegant salon interior',                            null,                                  false, 8);

-- ============================================================
-- 11. REWARD POINTS + HISTORY
-- ============================================================
create table if not exists reward_points (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null unique references profiles(id) on delete cascade,
  balance         int not null default 0,
  lifetime_earned int not null default 0,
  updated_at      timestamptz not null default now()
);

create trigger reward_points_updated_at
  before update on reward_points
  for each row execute function handle_updated_at();

create table if not exists reward_history (
  id             uuid primary key default gen_random_uuid(),
  customer_id    uuid not null references profiles(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  points         int not null,
  type           text not null check (type in ('earned','redeemed','bonus','expired','adjusted')),
  description    text not null,
  created_at     timestamptz not null default now()
);

create index if not exists reward_history_customer_idx on reward_history(customer_id);

-- ============================================================
-- 12. MEMBERSHIPS
-- ============================================================
create table if not exists memberships (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  price_monthly   numeric(8,2) not null,
  benefits        jsonb not null default '[]',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

insert into memberships (name, description, price_monthly, benefits) values
  ('Silver Member',   'Perfect for occasional visitors',      29.99, '["10% off all services","Priority booking","Birthday bonus points"]'),
  ('Gold Member',     'For our regular guests',               49.99, '["15% off all services","Priority booking","Free gel removal","Birthday bonus points","Monthly bonus: 100 pts"]'),
  ('Platinum Member', 'The ultimate pampering experience',    89.99, '["20% off all services","VIP priority booking","Free gel removal","Monthly complimentary service","Birthday bonus points","Monthly bonus: 250 pts","Dedicated technician"]');

-- ============================================================
-- 13. COUPONS
-- ============================================================
create table if not exists coupons (
  id             uuid primary key default gen_random_uuid(),
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

insert into coupons (location_id, code, description, discount_type, discount_value, min_spend, max_uses, expires_at) values
  ('00000000-0000-0000-0000-000000000001', 'WELCOME10',  'New client 10% off first visit',         'percent', 10,   null, null, now() + interval '1 year'),
  ('00000000-0000-0000-0000-000000000001', 'SUMMER25',   'Summer special — $25 off $80+',           'fixed',   25,   80,   200,  now() + interval '3 months'),
  ('00000000-0000-0000-0000-000000000001', 'BDAY15',     'Birthday month 15% discount',             'percent', 15,   null, null, now() + interval '6 months'),
  ('00000000-0000-0000-0000-000000000001', 'REFER20',    'Referral reward — 20% off for both',      'percent', 20,   null, null, now() + interval '1 year'),
  ('00000000-0000-0000-0000-000000000001', 'MANI10OFF',  '$10 off any manicure service',            'fixed',   10,   35,   100,  now() + interval '2 months'),
  ('00000000-0000-0000-0000-000000000001', 'PEDI5',      '$5 off any pedicure',                     'fixed',   5,    null, null, now() + interval '2 months'),
  ('00000000-0000-0000-0000-000000000001', 'SPADAY30',   '30% off full spa treatment package',      'percent', 30,   80,   50,   now() + interval '1 month'),
  ('00000000-0000-0000-0000-000000000001', 'LOYALTY50',  '50 bonus points on next visit',           'fixed',   0,    null, null, now() + interval '3 months'),
  ('00000000-0000-0000-0000-000000000001', 'FALLSPA',    'Fall seasonal — 12% off all spa',         'percent', 12,   null, null, now() + interval '4 months'),
  ('00000000-0000-0000-0000-000000000001', 'DEMO99',     'Demo test coupon',                        'fixed',   99,   null, 1,    now() + interval '1 day')
on conflict (code) do nothing;

-- ============================================================
-- 14. GIFT CARDS
-- ============================================================
create table if not exists gift_cards (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  initial_balance  numeric(8,2) not null,
  current_balance  numeric(8,2) not null,
  purchaser_email  text,
  recipient_email  text,
  is_active        boolean not null default true,
  expires_at       timestamptz,
  created_at       timestamptz not null default now()
);

insert into gift_cards (code, initial_balance, current_balance, purchaser_email, recipient_email, expires_at) values
  ('GC-DEMO-0001', 50,  50,  'demo@example.com', 'friend1@example.com', now() + interval '1 year'),
  ('GC-DEMO-0002', 100, 75,  'demo@example.com', 'friend2@example.com', now() + interval '1 year'),
  ('GC-DEMO-0003', 25,  25,  'demo@example.com', null,                  now() + interval '6 months')
on conflict (code) do nothing;

-- ============================================================
-- 15. SUPPLIERS
-- ============================================================
create table if not exists suppliers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  contact_name text,
  email        text,
  phone        text,
  website      text,
  notes        text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

insert into suppliers (id, name, contact_name, phone, website) values
  ('50000000-0000-0000-0000-000000000001', 'OPI Nail Supply',       'Tom Bradley',  '800-341-9999', 'https://www.opi.com'),
  ('50000000-0000-0000-0000-000000000002', 'Kiara Sky Nails',       'Lisa Nguyen',  '888-888-0101', 'https://www.kiarasky.com'),
  ('50000000-0000-0000-0000-000000000003', 'CND Professional',      'Ray Salter',   '800-444-2631', 'https://www.cnd.com'),
  ('50000000-0000-0000-0000-000000000004', 'Cuccio Naturale',       'Mary Fong',    '888-282-8246', 'https://www.cuccio.com'),
  ('50000000-0000-0000-0000-000000000005', 'Sally Beauty Supply',   'Dan Mills',    '866-234-9442', 'https://www.sallybeauty.com')
on conflict (id) do nothing;

-- ============================================================
-- 16. INVENTORY
-- ============================================================
create table if not exists inventory (
  id               uuid primary key default gen_random_uuid(),
  location_id      uuid not null references locations(id),
  supplier_id      uuid references suppliers(id) on delete set null,
  name             text not null,
  sku              text,
  barcode          text,
  category         text not null,
  purchase_price   numeric(8,2),
  retail_price     numeric(8,2),
  current_qty      int not null default 0,
  min_qty          int not null default 5,
  storage_location text,
  expiration_date  date,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists inventory_location_idx  on inventory(location_id);
create index if not exists inventory_category_idx  on inventory(category);

create trigger inventory_updated_at
  before update on inventory
  for each row execute function handle_updated_at();

-- Seed 25 demo inventory products
insert into inventory (location_id, supplier_id, name, sku, category, purchase_price, retail_price, current_qty, min_qty, storage_location) values
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'OPI Nail Polish — Bubble Bath',       'OPI-BB-001',  'Nail Polish',     4.50,  12.00, 24, 6,  'Shelf A1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'OPI Nail Polish — Lincoln Park',      'OPI-LP-002',  'Nail Polish',     4.50,  12.00, 18, 6,  'Shelf A1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'OPI Gel Color — Malaga Wine',         'OPI-GC-003',  'Gel Polish',      6.00,  18.00, 12, 4,  'Shelf A2'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'OPI Base Coat',                       'OPI-BC-004',  'Base/Top Coat',   5.00,  14.00, 8,  3,  'Shelf A3'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'OPI Top Coat',                        'OPI-TC-005',  'Base/Top Coat',   5.00,  14.00, 10, 3,  'Shelf A3'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'Kiara Sky Dip Powder — Nude',         'KS-DP-001',   'Dip Powder',      8.00,  22.00, 15, 5,  'Shelf B1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'Kiara Sky Dip Powder — Blush Pink',   'KS-DP-002',   'Dip Powder',      8.00,  22.00, 20, 5,  'Shelf B1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'Kiara Sky Dip Liquid Set',            'KS-DL-003',   'Dip Liquid',      12.00, 35.00, 6,  3,  'Shelf B2'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 'CND Shellac Base Coat',               'CND-SB-001',  'Gel Polish',      9.00,  25.00, 8,  3,  'Shelf B3'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 'CND Shellac Top Coat',                'CND-ST-002',  'Gel Polish',      9.00,  25.00, 8,  3,  'Shelf B3'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 'CND Shellac — Negligee',              'CND-SC-003',  'Gel Polish',      7.50,  20.00, 14, 4,  'Shelf B3'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Acrylic Powder — Clear',              'ACR-CL-001',  'Acrylic',         15.00, 40.00, 5,  2,  'Shelf C1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Acrylic Powder — Pink',               'ACR-PK-002',  'Acrylic',         15.00, 40.00, 7,  2,  'Shelf C1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Acrylic Liquid Monomer',              'ACR-LQ-003',  'Acrylic',         10.00, 28.00, 4,  2,  'Shelf C1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Nail Tips — Natural (500ct)',         'TIP-NT-001',  'Nail Tips',       3.00,  9.00,  10, 3,  'Cabinet D1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Nail Forms (250ct)',                  'FORM-001',    'Nail Forms',      4.00,  11.00, 8,  3,  'Cabinet D1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Cuticle Oil — Lavender',              'CUTL-OIL-01', 'Skincare',        3.50,  10.00, 20, 6,  'Shelf E1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', 'Cuccio Butter Blend — Milk & Honey', 'CUC-BB-001',  'Skincare',        5.00,  15.00, 12, 4,  'Shelf E1'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Pedicure Salt Soak',                  'PEDI-SS-001', 'Pedicure',        4.00,  12.00, 15, 5,  'Shelf E2'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Paraffin Wax — Unscented',            'WAX-PU-001',  'Pedicure',        8.00,  22.00, 6,  3,  'Cabinet D2'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Hard Wax Beads — Lavender',           'WAX-HW-001',  'Waxing',          6.00,  18.00, 10, 4,  'Cabinet D2'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Wax Strips (100ct)',                  'WAX-ST-001',  'Waxing',          3.00,  8.00,  8,  3,  'Cabinet D2'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Nail Drill Bits Set',                 'TOOL-DB-001', 'Tools',           18.00, 50.00, 3,  2,  'Cabinet D3'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Lint-Free Wipes (500ct)',             'TOOL-WP-001', 'Supplies',        4.00,  null,  25, 8,  'Cabinet D3'),
  ('00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Acetone — 16oz',                      'CHEM-AC-001', 'Chemicals',       3.00,  null,  3,  4,  'Cabinet D4');

-- ============================================================
-- 17. PURCHASE ORDERS
-- ============================================================
create table if not exists purchase_orders (
  id               uuid primary key default gen_random_uuid(),
  location_id      uuid not null references locations(id),
  supplier_id      uuid not null references suppliers(id),
  reference        text not null unique,
  status           text not null default 'draft' check (status in ('draft','pending','approved','ordered','partially_received','received','cancelled')),
  notes            text,
  total_amount     numeric(10,2) not null default 0,
  ordered_at       timestamptz,
  expected_at      timestamptz,
  received_at      timestamptz,
  created_by       uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger purchase_orders_updated_at
  before update on purchase_orders
  for each row execute function handle_updated_at();

create table if not exists purchase_order_items (
  id                uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  inventory_id      uuid not null references inventory(id),
  qty_ordered       int not null,
  qty_received      int not null default 0,
  unit_price        numeric(8,2) not null
);

-- Seed 5 demo purchase orders
insert into purchase_orders (id, location_id, supplier_id, reference, status, total_amount, ordered_at, expected_at, received_at) values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'PO-2025-001', 'received',          180.00, now()-interval '30 days', now()-interval '25 days', now()-interval '24 days'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'PO-2025-002', 'received',          112.00, now()-interval '20 days', now()-interval '15 days', now()-interval '14 days'),
  ('60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 'PO-2025-003', 'ordered',            81.00, now()-interval '5 days',  now()+interval '3 days',  null),
  ('60000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'PO-2025-004', 'approved',           74.00, null,                     now()+interval '7 days',  null),
  ('60000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', 'PO-2025-005', 'draft',              45.00, null,                     null,                     null)
on conflict (id) do nothing;

-- ============================================================
-- 18. AUDIT LOGS
-- ============================================================
create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete set null,
  action      text not null,
  table_name  text not null,
  record_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists audit_logs_user_idx  on audit_logs(user_id);
create index if not exists audit_logs_table_idx on audit_logs(table_name);
create index if not exists audit_logs_time_idx  on audit_logs(created_at desc);

-- ============================================================
-- 19. SETTINGS
-- ============================================================
create table if not exists settings (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id),
  key         text not null,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  unique(location_id, key)
);

create trigger settings_updated_at
  before update on settings
  for each row execute function handle_updated_at();

insert into settings (location_id, key, value) values
  ('00000000-0000-0000-0000-000000000001', 'demo_mode',            'true'),
  ('00000000-0000-0000-0000-000000000001', 'booking_enabled',      'true'),
  ('00000000-0000-0000-0000-000000000001', 'loyalty_rate',         '1'),
  ('00000000-0000-0000-0000-000000000001', 'loyalty_enabled',      'true'),
  ('00000000-0000-0000-0000-000000000001', 'slot_interval_min',    '15'),
  ('00000000-0000-0000-0000-000000000001', 'booking_advance_days', '30')
on conflict (location_id, key) do nothing;

-- ============================================================
-- 20. SEED 15 DEMO APPOINTMENTS (spread over last 30 days)
-- ============================================================
insert into appointments (reference, location_id, employee_id, service_id, status, appointment_date, appointment_time, duration_min, first_name, last_name, phone, email, source, demo_mode) values
  ('ANS-000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'completed',  current_date-28, '10:00', 50, 'Sarah',    'Mitchell', '5401112222', 'sarah.m@example.com',   'online',   true),
  ('ANS-000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'completed',  current_date-25, '11:00', 65, 'Jennifer', 'Lopez',    '5402223333', 'jen.l@example.com',     'online',   true),
  ('ANS-000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'completed',  current_date-22, '13:00', 65, 'Maria',    'Rodriguez','5403334444', 'maria.r@example.com',   'phone',    true),
  ('ANS-000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', 'completed',  current_date-20, '14:00', 60, 'Ashley',   'Thomas',   '5404445555', 'ashley.t@example.com',  'online',   true),
  ('ANS-000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008', 'completed',  current_date-18, '10:30', 90, 'Rachel',   'Kim',      '5405556666', 'rachel.k@example.com',  'online',   true),
  ('ANS-000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'completed',  current_date-15, '15:00', 80, 'Brittany', 'Wilson',   '5406667777', 'britt.w@example.com',   'walk_in',  true),
  ('ANS-000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'completed',  current_date-12, '09:00', 50, 'Donna',    'Parker',   '5407778888', 'donna.p@example.com',   'online',   true),
  ('ANS-000008', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', 'completed',  current_date-10, '12:00', 40, 'Cynthia',  'Harris',   '5408889999', 'cyn.h@example.com',     'phone',    true),
  ('ANS-000009', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000007', 'completed',  current_date-8,  '11:30', 30, 'Tiffany',  'Scott',    '5409990000', 'tiff.s@example.com',    'walk_in',  true),
  ('ANS-000010', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'completed',  current_date-5,  '14:30', 50, 'Nicole',   'Baker',    '5401234567', 'nicole.b@example.com',  'online',   true),
  ('ANS-000011', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'confirmed',  current_date+1,  '10:00', 65, 'Lauren',   'Adams',    '5402345678', 'lauren.a@example.com',  'online',   true),
  ('ANS-000012', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'confirmed',  current_date+1,  '13:00', 65, 'Amanda',   'Clark',    '5403456789', 'amanda.c@example.com',  'online',   true),
  ('ANS-000013', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', 'confirmed',  current_date+2,  '11:00', 60, 'Megan',    'Turner',   '5404567890', 'megan.t@example.com',   'phone',    true),
  ('ANS-000014', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008', 'pending',    current_date+3,  '14:00', 90, 'Stephanie','White',    '5405678901', 'steph.w@example.com',   'online',   true),
  ('ANS-000015', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'pending',    current_date+4,  '15:30', 80, 'Crystal',  'Moore',    '5406789012', 'crystal.m@example.com', 'online',   true)
on conflict (reference) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table locations           enable row level security;
alter table profiles            enable row level security;
alter table employees           enable row level security;
alter table service_categories  enable row level security;
alter table services            enable row level security;
alter table appointments        enable row level security;
alter table messages            enable row level security;
alter table newsletter_subscribers enable row level security;
alter table reviews             enable row level security;
alter table gallery             enable row level security;
alter table reward_points       enable row level security;
alter table reward_history      enable row level security;
alter table memberships         enable row level security;
alter table coupons             enable row level security;
alter table gift_cards          enable row level security;
alter table suppliers           enable row level security;
alter table inventory           enable row level security;
alter table purchase_orders     enable row level security;
alter table purchase_order_items enable row level security;
alter table audit_logs          enable row level security;
alter table settings            enable row level security;

-- Helper: is the current user a staff/admin/owner?
create or replace function is_staff()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role in ('owner','admin','staff')
  );
$$;

-- PUBLIC READ: locations, service_categories, services, employees, reviews, gallery, memberships, coupons
create policy "public_read_locations"          on locations           for select using (true);
create policy "public_read_service_categories" on service_categories  for select using (is_active = true);
create policy "public_read_services"           on services            for select using (is_active = true);
create policy "public_read_employees"          on employees           for select using (is_active = true);
create policy "public_read_reviews"            on reviews             for select using (true);
create policy "public_read_gallery"            on gallery             for select using (true);
create policy "public_read_memberships"        on memberships         for select using (is_active = true);
create policy "public_read_coupons"            on coupons             for select using (is_active = true);

-- APPOINTMENTS: public insert (booking), customer sees own, staff sees all
create policy "public_insert_appointments" on appointments for insert with check (true);
create policy "staff_all_appointments"     on appointments for all    using (is_staff());
create policy "customer_own_appointments"  on appointments for select using (auth.uid() = customer_id);

-- MESSAGES: public insert, staff manages
create policy "public_insert_messages" on messages for insert with check (true);
create policy "staff_all_messages"     on messages for all    using (is_staff());

-- NEWSLETTER: public insert
create policy "public_insert_newsletter" on newsletter_subscribers for insert with check (true);
create policy "staff_all_newsletter"     on newsletter_subscribers for all using (is_staff());

-- PROFILES: users see/edit own, staff sees all
create policy "user_own_profile"    on profiles for all    using (auth.uid() = id);
create policy "staff_all_profiles"  on profiles for select using (is_staff());

-- REWARDS: customer sees own, staff manages all
create policy "customer_own_reward_points"  on reward_points  for select using (auth.uid() = customer_id);
create policy "staff_all_reward_points"     on reward_points  for all    using (is_staff());
create policy "customer_own_reward_history" on reward_history for select using (auth.uid() = customer_id);
create policy "staff_all_reward_history"    on reward_history for all    using (is_staff());

-- STAFF-ONLY: inventory, suppliers, purchase orders, audit logs, settings, gift cards
create policy "staff_all_inventory"        on inventory              for all using (is_staff());
create policy "staff_all_suppliers"        on suppliers              for all using (is_staff());
create policy "staff_all_purchase_orders"  on purchase_orders        for all using (is_staff());
create policy "staff_all_po_items"         on purchase_order_items   for all using (is_staff());
create policy "staff_all_audit_logs"       on audit_logs             for select using (is_staff());
create policy "staff_all_settings"         on settings               for all using (is_staff());
create policy "staff_all_gift_cards"       on gift_cards             for all using (is_staff());
