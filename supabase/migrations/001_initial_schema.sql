-- =============================================
-- Sri Kanakadhara Rice Mill Manager
-- Database Schema - Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── BATCHES TABLE ───────────────────────────────────────────────
create table if not exists batches (
  id            uuid primary key default uuid_generate_v4(),
  batch_number  text not null unique,
  date          date not null,

  -- Paddy input
  paddy_qty     numeric(10,2) not null default 0,
  paddy_price   numeric(10,2) not null default 0,

  -- Costs
  labor_cost        numeric(10,2) not null default 0,
  electricity_cost  numeric(10,2) not null default 0,
  transport_cost    numeric(10,2) not null default 0,
  packaging_cost    numeric(10,2) not null default 0,
  other_cost        numeric(10,2) not null default 0,

  -- Calculated totals (stored for fast querying)
  raw_material_cost numeric(10,2) generated always as (paddy_qty * paddy_price) stored,
  total_cost        numeric(10,2) not null default 0,
  total_sales       numeric(10,2) not null default 0,
  profit            numeric(10,2) not null default 0,
  margin            numeric(6,2)  not null default 0,
  profit_per_kg     numeric(10,4) not null default 0,
  yield_percent     numeric(6,2)  not null default 0,

  -- Metadata
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── OUTPUTS TABLE ───────────────────────────────────────────────
create table if not exists batch_outputs (
  id            uuid primary key default uuid_generate_v4(),
  batch_id      uuid not null references batches(id) on delete cascade,

  -- Rice
  rice_qty      numeric(10,2) not null default 0,
  rice_price    numeric(10,2) not null default 0,

  -- Broken rice
  broken_qty    numeric(10,2) not null default 0,
  broken_price  numeric(10,2) not null default 0,

  -- Bran
  bran_qty      numeric(10,2) not null default 0,
  bran_price    numeric(10,2) not null default 0,

  -- Husk
  husk_qty      numeric(10,2) not null default 0,
  husk_price    numeric(10,2) not null default 0,

  created_at    timestamptz default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────
create index if not exists idx_batches_date on batches(date desc);
create index if not exists idx_batches_batch_number on batches(batch_number);
create index if not exists idx_batches_profit on batches(profit);
create index if not exists idx_outputs_batch_id on batch_outputs(batch_id);

-- ─── AUTO UPDATE updated_at ──────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger batches_updated_at
  before update on batches
  for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY (open for now - add auth later) ──────────
alter table batches enable row level security;
alter table batch_outputs enable row level security;

-- Allow all operations (no auth required - suitable for single-owner mill app)
create policy "Allow all on batches" on batches for all using (true) with check (true);
create policy "Allow all on batch_outputs" on batch_outputs for all using (true) with check (true);

-- ─── SAMPLE DATA (optional - delete after testing) ───────────────
insert into batches (batch_number, date, paddy_qty, paddy_price, labor_cost, electricity_cost, transport_cost, packaging_cost, other_cost, total_cost, total_sales, profit, margin, profit_per_kg, yield_percent)
values
  ('B-001', '2025-03-01', 1000, 22, 800, 400, 300, 200, 100, 23800, 27390, 3590, 13.11, 3.59, 65),
  ('B-002', '2025-03-05', 800, 23, 700, 350, 250, 180, 80, 20160, 22020, 1860, 8.45, 2.33, 63.75),
  ('B-003', '2025-03-10', 1200, 22.5, 900, 480, 350, 240, 120, 29090, 35618, 6528, 18.33, 5.44, 64.17);

insert into batch_outputs (batch_id, rice_qty, rice_price, broken_qty, broken_price, bran_qty, bran_price, husk_qty, husk_price)
select id, 650, 38, 80, 18, 120, 12, 150, 3 from batches where batch_number = 'B-001';
insert into batch_outputs (batch_id, rice_qty, rice_price, broken_qty, broken_price, bran_qty, bran_price, husk_qty, husk_price)
select id, 510, 37, 60, 17, 95, 12, 135, 3 from batches where batch_number = 'B-002';
insert into batch_outputs (batch_id, rice_qty, rice_price, broken_qty, broken_price, bran_qty, bran_price, husk_qty, husk_price)
select id, 770, 39, 100, 18.5, 145, 12.5, 185, 3 from batches where batch_number = 'B-003';
