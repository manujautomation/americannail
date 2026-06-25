-- Replace demo employees with real staff names
-- All are All Services Experts, no specialty

delete from employees where location_id = '00000000-0000-0000-0000-000000000001';

insert into employees (id, location_id, display_name, role, specialty, years_experience, is_active, sort_order) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Christina', 'Nail Technician', null, 0, true, 1),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Ruby',      'Nail Technician', null, 0, true, 2),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Lynn',      'Nail Technician', null, 0, true, 3),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Bobby',     'Nail Technician', null, 0, true, 4);
