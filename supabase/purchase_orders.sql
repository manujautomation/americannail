-- Purchase Orders tables and inventory RPC

create table if not exists purchase_orders (
  id            uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  status        text not null default 'pending' check (status in ('pending','ordered','received','cancelled')),
  total_cost    numeric(10,2) default 0,
  notes         text,
  created_by    uuid references auth.users(id),
  received_by   uuid references auth.users(id),
  received_at   timestamptz,
  created_at    timestamptz default now()
);

create table if not exists purchase_order_lines (
  id                  uuid primary key default gen_random_uuid(),
  purchase_order_id   uuid not null references purchase_orders(id) on delete cascade,
  inventory_id        uuid not null references inventory(id),
  qty_ordered         int not null check (qty_ordered > 0),
  qty_received        int not null default 0,
  unit_cost           numeric(10,2) not null default 0
);

-- RPC to safely increment inventory qty
create or replace function increment_inventory_qty(p_inventory_id uuid, p_amount int)
returns void language plpgsql security definer as $$
begin
  update inventory
  set current_qty = current_qty + p_amount
  where id = p_inventory_id;
end;
$$;
