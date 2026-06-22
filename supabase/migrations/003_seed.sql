-- ============================================================
-- Demo Seed Data — American Nails & Spa
-- Run AFTER 001_schema.sql and 002_rls.sql
-- Creates realistic demo data for the pitch presentation
-- ============================================================

-- ─── LOCATION ────────────────────────────────
insert into locations (id, name, address, city, state, zip, phone, email)
values (
  '00000000-0000-0000-0000-000000000001',
  'American Nails & Spa',
  '640 Warrior Dr Ste 106',
  'Stephens City', 'VA', '22655',
  '+15408682811',
  'manuj.automation.ssn@gmail.com'  -- FUTURE: replace with owner email
);

-- ─── SERVICE CATEGORIES ──────────────────────
insert into service_categories (id, name, sort_order) values
  ('10000000-0000-0000-0000-000000000001', 'Manicure',       1),
  ('10000000-0000-0000-0000-000000000002', 'Pedicure',       2),
  ('10000000-0000-0000-0000-000000000003', 'Nail Art',       3),
  ('10000000-0000-0000-0000-000000000004', 'Enhancements',   4),
  ('10000000-0000-0000-0000-000000000005', 'Spa & Massage',  5),
  ('10000000-0000-0000-0000-000000000006', 'Waxing',         6);

-- ─── SERVICES ────────────────────────────────
insert into services (id, category_id, location_id, name, description, duration_min, price_min, price_max, sort_order) values
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'Gel Manicure', 'Long-lasting glossy gel polish, chip-free for weeks.', 45, null, null, 1),

  ('20000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000001',
   'Acrylic Nails', 'Durable custom acrylic enhancements sculpted to shape.', 90, null, null, 2),

  ('20000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000001',
   'Dip Powder', 'Lightweight odor-free powder for a natural look.', 75, null, null, 3),

  ('20000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Spa Pedicure', 'Relaxing foot care with exfoliation and massage.', 60, null, null, 4),

  ('20000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000001',
   'Foot Massage', 'Stress-relieving therapeutic foot massage.', 30, null, null, 5),

  ('20000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'Nail Art', 'Custom artistic designs and seasonal styles.', 60, null, null, 6),

  ('20000000-0000-0000-0000-000000000007',
   '10000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000001',
   'Waxing', 'Facial and body waxing for smooth results.', 30, null, null, 7),

  ('20000000-0000-0000-0000-000000000008',
   '10000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000001',
   'Spa Treatment', 'Indulgent full-service spa experience.', 90, null, null, 8);

-- ─── EMPLOYEES ───────────────────────────────
insert into employees (location_id, display_name, role, specialty, years_experience, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'Lily Chen',   'Lead Nail Technician', 'Nail Art & Acrylics', 6, 1),
  ('00000000-0000-0000-0000-000000000001', 'Sophie Tran', 'Spa Specialist',        'Pedicures & Massage', 4, 2),
  ('00000000-0000-0000-0000-000000000001', 'Anna Kim',    'Color Expert',          'Gel & Dip Powder',    5, 3);

-- ─── DEMO REVIEWS ────────────────────────────
insert into reviews (location_id, customer_name, rating, text, service_name, source, is_featured) values
  ('00000000-0000-0000-0000-000000000001', 'Sarah M.',   5,
   'Absolutely love this place! My gel manicure lasted over three weeks without chipping. Will definitely be back!',
   'Gel Manicure', 'demo', true),

  ('00000000-0000-0000-0000-000000000001', 'Jennifer L.', 5,
   'Best pedicure I''ve ever had. The foot massage alone was worth it. My go-to spot!',
   'Spa Pedicure', 'demo', true),

  ('00000000-0000-0000-0000-000000000001', 'Maria R.',   4,
   'Great nail art! They did exactly what I wanted from just a reference photo.',
   'Nail Art', 'demo', true),

  ('00000000-0000-0000-0000-000000000001', 'Ashley T.',  5,
   'Clean, professional, and so relaxing. The staff is incredibly friendly and talented.',
   'Spa Treatment', 'demo', false),

  ('00000000-0000-0000-0000-000000000001', 'Brittany K.', 4,
   'Love the dip powder here. Lasts so long and looks amazing. Prices are very fair.',
   'Dip Powder', 'demo', false),

  ('00000000-0000-0000-0000-000000000001', 'Diana W.',   5,
   'My nails have never looked better! The nail art is stunning and it dried so quickly.',
   'Nail Art', 'demo', false),

  ('00000000-0000-0000-0000-000000000001', 'Cathy P.',   4,
   'Very nice salon. Always clean and the technicians are highly skilled.',
   'Gel Manicure', 'demo', false),

  ('00000000-0000-0000-0000-000000000001', 'Linda H.',   5,
   'I brought my daughter for her first manicure and they were so sweet to her. Love this place!',
   'Gel Manicure', 'demo', false),

  ('00000000-0000-0000-0000-000000000001', 'Rachel S.',  5,
   'The acrylic set I got here is perfect. They listened to exactly what I wanted.',
   'Acrylic Nails', 'demo', false),

  ('00000000-0000-0000-0000-000000000001', 'Megan B.',   4,
   'Great experience! I always leave feeling pampered. Will definitely keep coming back.',
   'Spa Pedicure', 'demo', false);

-- ─── GALLERY ─────────────────────────────────
insert into gallery (location_id, image_url, alt_text, is_featured, sort_order) values
  ('00000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=85',
   'Luxury gel manicure with rose gold accents', true, 1),
  ('00000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=800&q=85',
   'Custom acrylic nail art design', true, 2),
  ('00000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1610992015779-c4a8c0f8d4d7?w=800&q=85',
   'Elegant dip powder nails', false, 3),
  ('00000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&q=85',
   'Relaxing spa pedicure treatment', false, 4),
  ('00000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=85',
   'Premium spa treatment experience', false, 5),
  ('00000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=85',
   'Elegant salon interior', false, 6),
  ('00000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=85',
   'Therapeutic foot massage', false, 7),
  ('00000000-0000-0000-0000-000000000001',
   'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=85',
   'Professional waxing services', false, 8);

-- ─── MEMBERSHIPS ─────────────────────────────
insert into memberships (name, description, price_monthly, benefits) values
  ('Silver', 'Perfect for regular visitors',  29.99,
   '["10% off all services","Priority booking","Free nail art add-on monthly"]'::jsonb),
  ('Gold',   'Our most popular membership',   49.99,
   '["15% off all services","Priority booking","Free gel upgrade","Monthly loyalty bonus points"]'::jsonb),
  ('Platinum','The ultimate spa experience',   79.99,
   '["20% off all services","VIP priority booking","Free spa treatment monthly","Double loyalty points","Exclusive seasonal offers"]'::jsonb);

-- ─── COUPONS ─────────────────────────────────
insert into coupons (location_id, code, description, discount_type, discount_value, max_uses, expires_at) values
  ('00000000-0000-0000-0000-000000000001',
   'WELCOME10', 'Welcome — 10% off your first visit', 'percent', 10, 100,
   now() + interval '6 months'),
  ('00000000-0000-0000-0000-000000000001',
   'SUMMER25', 'Summer special — $25 off any spa treatment', 'fixed', 25, 50,
   now() + interval '3 months'),
  ('00000000-0000-0000-0000-000000000001',
   'NAILART15', '15% off any nail art service', 'percent', 15, 200,
   now() + interval '4 months');

-- ─── SUPPLIERS ───────────────────────────────
insert into suppliers (name, contact_name, email, phone) values
  ('OPI Professional',      'Sales Rep',    'orders@opi.com',       '1-800-341-9999'),
  ('CND Beauty',            'Account Mgr',  'accounts@cnd.com',     '1-800-221-3496'),
  ('NSI Nails International','Rep',         'sales@nsinails.com',   '1-800-354-6741');

-- ─── INVENTORY (25 demo products) ────────────
insert into inventory (location_id, name, category, current_qty, min_qty, purchase_price, retail_price) values
  ('00000000-0000-0000-0000-000000000001', 'OPI Gel Color - Bubble Bath',          'Gel Polish',        12, 5, 8.50,  18.00),
  ('00000000-0000-0000-0000-000000000001', 'OPI Gel Color - Lincoln Park',         'Gel Polish',         8, 5, 8.50,  18.00),
  ('00000000-0000-0000-0000-000000000001', 'CND Shellac - Romantique',             'Gel Polish',        15, 5, 7.80,  16.00),
  ('00000000-0000-0000-0000-000000000001', 'CND Shellac - Crimson Sash',           'Gel Polish',         6, 5, 7.80,  16.00),
  ('00000000-0000-0000-0000-000000000001', 'NSI Acrylic Powder - Clear Pink',      'Acrylic',           3,  4, 14.00, 28.00),
  ('00000000-0000-0000-0000-000000000001', 'NSI Acrylic Powder - Bright White',    'Acrylic',           5,  4, 14.00, 28.00),
  ('00000000-0000-0000-0000-000000000001', 'NSI Acrylic Liquid Monomer 8oz',       'Acrylic',           4,  3, 12.00, 24.00),
  ('00000000-0000-0000-0000-000000000001', 'Kiara Sky Dip Powder - Always Blushing','Dip Powder',       10, 5,  9.00, 20.00),
  ('00000000-0000-0000-0000-000000000001', 'Kiara Sky Dip Powder - Nude Happens',  'Dip Powder',        7,  5,  9.00, 20.00),
  ('00000000-0000-0000-0000-000000000001', 'Nitrile Gloves - Medium (100ct)',      'Sanitation',        6,  3,  8.00,  0.00),
  ('00000000-0000-0000-0000-000000000001', 'Nitrile Gloves - Large (100ct)',       'Sanitation',        4,  3,  8.00,  0.00),
  ('00000000-0000-0000-0000-000000000001', 'Hospital Grade Disinfectant Spray 1L', 'Sanitation',        8,  4, 12.00,  0.00),
  ('00000000-0000-0000-0000-000000000001', 'Pedicure Liner Bags (100ct)',          'Sanitation',        3,  4,  6.00,  0.00),
  ('00000000-0000-0000-0000-000000000001', 'Nail Prep Dehydrator 2oz',             'Prep',              9,  4,  4.00,  8.00),
  ('00000000-0000-0000-0000-000000000001', 'PH Bond Primer 0.5oz',                'Prep',              7,  4,  5.00, 10.00),
  ('00000000-0000-0000-0000-000000000001', 'Cuticle Oil Lavender 15ml',            'Retail',            20, 8,  3.50,  9.00),
  ('00000000-0000-0000-0000-000000000001', 'OPI Top Coat 0.5oz',                  'Retail',            11, 5,  4.00, 10.00),
  ('00000000-0000-0000-0000-000000000001', 'OPI Base Coat 0.5oz',                 'Retail',            10, 5,  4.00, 10.00),
  ('00000000-0000-0000-0000-000000000001', 'Nail File 180/180 Grit (50ct)',        'Tools',             14, 6,  6.00,  0.00),
  ('00000000-0000-0000-0000-000000000001', 'Buffer Blocks 100/180 (20ct)',         'Tools',              5, 4,  8.00,  0.00),
  ('00000000-0000-0000-0000-000000000001', 'Foot Scrub Exfoliating Gel 8oz',      'Spa',                6, 3, 10.00, 22.00),
  ('00000000-0000-0000-0000-000000000001', 'Paraffin Wax Lavender 6lb',           'Spa',                4, 2, 18.00,  0.00),
  ('00000000-0000-0000-0000-000000000001', 'Hot Towels 12ct',                     'Spa',                9, 4,  7.00,  0.00),
  ('00000000-0000-0000-0000-000000000001', 'Wax Hard Beads Rose 400g',            'Waxing',             5, 3, 11.00,  0.00),
  ('00000000-0000-0000-0000-000000000001', 'Wax Strips 100ct',                    'Waxing',             8, 4,  5.00,  0.00);

-- ─── DEMO APPOINTMENTS (15) ──────────────────
-- Note: These use fixed past/future dates relative to seed time.
-- Adjust appointment_date as needed.
insert into appointments
  (reference, location_id, service_id, status, appointment_date, appointment_time,
   duration_min, first_name, last_name, phone, source, demo_mode)
values
  ('ANS-DEMO01','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',
   'completed', current_date - 14, '10:00', 45, 'Sarah',    'M.',       '5401110001', 'online',    true),
  ('ANS-DEMO02','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004',
   'completed', current_date - 12, '11:00', 60, 'Jennifer', 'L.',       '5401110002', 'walk_in',   true),
  ('ANS-DEMO03','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000006',
   'completed', current_date - 10, '14:00', 60, 'Maria',    'R.',       '5401110003', 'phone',     true),
  ('ANS-DEMO04','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002',
   'completed', current_date - 8,  '10:30', 90, 'Ashley',   'T.',       '5401110004', 'online',    true),
  ('ANS-DEMO05','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003',
   'completed', current_date - 7,  '13:00', 75, 'Brittany', 'K.',       '5401110005', 'online',    true),
  ('ANS-DEMO06','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008',
   'completed', current_date - 5,  '15:00', 90, 'Diana',    'W.',       '5401110006', 'walk_in',   true),
  ('ANS-DEMO07','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',
   'completed', current_date - 4,  '11:00', 45, 'Cathy',    'P.',       '5401110007', 'phone',     true),
  ('ANS-DEMO08','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004',
   'completed', current_date - 3,  '10:00', 60, 'Linda',    'H.',       '5401110008', 'online',    true),
  ('ANS-DEMO09','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002',
   'completed', current_date - 2,  '14:30', 90, 'Rachel',   'S.',       '5401110009', 'online',    true),
  ('ANS-DEMO10','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004',
   'completed', current_date - 1,  '12:00', 60, 'Megan',    'B.',       '5401110010', 'walk_in',   true),
  ('ANS-DEMO11','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',
   'confirmed', current_date + 1,  '10:00', 45, 'Emily',    'Johnson',  '5401110011', 'online',    true),
  ('ANS-DEMO12','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003',
   'confirmed', current_date + 1,  '13:00', 75, 'Olivia',   'Davis',    '5401110012', 'online',    true),
  ('ANS-DEMO13','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000006',
   'pending',   current_date + 2,  '11:30', 60, 'Grace',    'Martinez', '5401110013', 'online',    true),
  ('ANS-DEMO14','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008',
   'confirmed', current_date + 3,  '14:00', 90, 'Hana',     'Wilson',   '5401110014', 'phone',     true),
  ('ANS-DEMO15','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002',
   'pending',   current_date + 4,  '10:30', 90, 'Isabelle', 'Moore',    '5401110015', 'online',    true);

-- ─── SETTINGS ────────────────────────────────
insert into settings (location_id, key, value) values
  ('00000000-0000-0000-0000-000000000001', 'booking_enabled',    'true'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'demo_mode',          'true'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'loyalty_multiplier', '1'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'walk_ins_welcome',   'true'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'cancellation_hours', '24'::jsonb);
