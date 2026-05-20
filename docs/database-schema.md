# Database Schema Draft

Recommended database: PostgreSQL.

Use integer minor units for money where possible, or `numeric(38, 18)` when decimal precision is required. USDT user-facing amounts can be stored as `numeric(30, 6)`.

## users

- id uuid primary key
- wallet_address text unique not null
- wallet_type text
- status text not null default 'active'
- kyc_status text not null default 'not_submitted'
- risk_tier text not null default 'standard'
- region_code text
- created_at timestamptz not null
- updated_at timestamptz not null

## sessions

- id uuid primary key
- user_id uuid references users(id)
- nonce text not null
- expires_at timestamptz not null
- used_at timestamptz
- created_at timestamptz not null

## markets

- id uuid primary key
- type text not null
- category text not null
- title text not null
- league text
- status text not null
- starts_at timestamptz
- closes_at timestamptz
- settlement_source text
- settlement_result jsonb
- created_by uuid references users(id)
- created_at timestamptz not null
- updated_at timestamptz not null

## market_participants

- id uuid primary key
- market_id uuid references markets(id)
- role text not null
- name text not null
- short_code text
- logo_url text
- color text

## market_options

- id uuid primary key
- market_id uuid references markets(id)
- group_key text not null
- label text not null
- side_type text not null
- sellable boolean not null default true
- sort_order int not null

Examples:

- group_key = `match_result`, label = `MUN`, side_type = `yes_no`
- group_key = `correct_score`, label = `1-0`, side_type = `yes_no`, sellable = false
- group_key = `crypto_direction`, label = `Up`, side_type = `up_down`

## odds_snapshots

- id uuid primary key
- market_option_id uuid references market_options(id)
- yes_odds numeric(18, 6)
- no_odds numeric(18, 6)
- up_odds numeric(18, 6)
- down_odds numeric(18, 6)
- source text not null default 'admin'
- created_at timestamptz not null

## account_balances

- user_id uuid primary key references users(id)
- available_usdt numeric(30, 6) not null default 0
- frozen_usdt numeric(30, 6) not null default 0
- trading_usdt numeric(30, 6) not null default 0
- vault_usdt numeric(30, 6) not null default 0
- claimable_usdt numeric(30, 6) not null default 0
- locked_inf numeric(30, 6) not null default 0
- updated_at timestamptz not null

## ledger_entries

- id uuid primary key
- user_id uuid references users(id)
- type text not null
- asset text not null
- amount numeric(30, 6) not null
- balance_bucket text
- status text not null
- ref_type text
- ref_id uuid
- note text
- created_at timestamptz not null

## orders

- id uuid primary key
- user_id uuid references users(id)
- market_id uuid references markets(id)
- market_option_id uuid references market_options(id)
- side text not null
- amount_usdt numeric(30, 6) not null
- odds numeric(18, 6) not null
- potential_return_usdt numeric(30, 6) not null
- insurance_enabled boolean not null default false
- status text not null
- created_at timestamptz not null

## positions

- id uuid primary key
- user_id uuid references users(id)
- order_id uuid references orders(id)
- market_id uuid references markets(id)
- market_option_id uuid references market_options(id)
- side text not null
- amount_usdt numeric(30, 6) not null
- odds numeric(18, 6) not null
- status text not null
- sellable boolean not null
- settled_return_usdt numeric(30, 6)
- created_at timestamptz not null
- settled_at timestamptz

## vault_movements

- id uuid primary key
- user_id uuid references users(id)
- direction text not null
- amount_usdt numeric(30, 6) not null
- status text not null
- created_at timestamptz not null

## vault_yield_entries

- id uuid primary key
- user_id uuid references users(id)
- principal_usdt numeric(30, 6) not null
- yield_usdt numeric(30, 6) not null
- inf_boost numeric(18, 6) not null
- settlement_date date not null
- created_at timestamptz not null

## insurance_nodes

- id uuid primary key
- user_id uuid references users(id)
- order_id uuid references orders(id)
- market_id uuid references markets(id)
- premium_usdt numeric(30, 6) not null
- max_cover_usdt numeric(30, 6) not null
- period_amount_usdt numeric(30, 6) not null
- status text not null
- phase text
- created_at timestamptz not null
- claimed_at timestamptz

## rewards_entries

- id uuid primary key
- user_id uuid references users(id)
- source_type text not null
- source_id uuid
- credits numeric(30, 6) not null
- multiplier numeric(18, 6)
- status text not null default 'locked'
- created_at timestamptz not null

## withdrawals

- id uuid primary key
- user_id uuid references users(id)
- address text not null
- amount_usdt numeric(30, 6) not null
- risk_level text not null
- status text not null
- tx_signature text
- reviewed_by uuid references users(id)
- created_at timestamptz not null
- reviewed_at timestamptz
- broadcast_at timestamptz

## deposits

- id uuid primary key
- user_id uuid references users(id)
- chain text not null
- address text not null
- tx_signature text unique
- amount_usdt numeric(30, 6) not null
- confirmations int not null default 0
- status text not null
- created_at timestamptz not null
- confirmed_at timestamptz

## audit_logs

- id uuid primary key
- actor_user_id uuid references users(id)
- action text not null
- entity_type text not null
- entity_id uuid
- payload jsonb
- created_at timestamptz not null
