-- Update existing staff names in place (preserves appointment FK references)
update employees set display_name = 'Christina', role = 'Nail Technician', specialty = null where id = '10000000-0000-0000-0000-000000000001';
update employees set display_name = 'Ruby',      role = 'Nail Technician', specialty = null where id = '10000000-0000-0000-0000-000000000002';
update employees set display_name = 'Lynn',      role = 'Nail Technician', specialty = null where id = '10000000-0000-0000-0000-000000000003';

-- Add Bobby as a new 4th technician
insert into employees (id, location_id, display_name, role, specialty, years_experience, is_active, sort_order)
values ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Bobby', 'Nail Technician', null, 0, true, 4)
on conflict (id) do update set display_name = 'Bobby', role = 'Nail Technician', specialty = null;
