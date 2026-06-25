-- Add missing columns to existing purchase_orders table
alter table purchase_orders add column if not exists supplier_name text;
alter table purchase_orders add column if not exists total_cost numeric(10,2) default 0;
alter table purchase_orders add column if not exists notes text;
alter table purchase_orders add column if not exists received_by uuid references auth.users(id);
alter table purchase_orders add column if not exists received_at timestamptz;

-- Add missing columns to existing purchase_order_lines table (may be named purchase_order_items)
-- First check which table exists and add to it
alter table purchase_order_lines add column if not exists qty_received int not null default 0;
alter table purchase_order_lines add column if not exists unit_cost numeric(10,2) not null default 0;

-- Create purchase_order_lines if it doesn't exist at all
create table if not exists purchase_order_lines (
  id                  uuid primary key default gen_random_uuid(),
  purchase_order_id   uuid not null references purchase_orders(id) on delete cascade,
  inventory_id        uuid not null references inventory(id),
  qty_ordered         int not null check (qty_ordered > 0),
  qty_received        int not null default 0,
  unit_cost           numeric(10,2) not null default 0
);

-- RPC to safely increment inventory qty (create if not exists)
create or replace function increment_inventory_qty(p_inventory_id uuid, p_amount int)
returns void language plpgsql security definer as $$
begin
  update inventory
  set current_qty = current_qty + p_amount
  where id = p_inventory_id;
end;
$$;
