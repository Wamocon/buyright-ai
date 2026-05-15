-- BuyRight AI - Initial Database Schema
-- Migration: 20260515120000_initial_schema.sql

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- profiles - extends Supabase auth.users
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro')),
  subscription_status text check (subscription_status in ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  daily_checks_used integer not null default 0,
  last_check_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
create index idx_profiles_email on public.profiles(email);

-- ============================================================================
-- product_checks - stores each analysis request
-- ============================================================================
create table public.product_checks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  anonymous_ip text,
  input_type text not null check (input_type in ('url', 'image', 'text')),
  input_value text not null,
  image_url text,
  result jsonb,
  score integer check (score >= 0 and score <= 100),
  recommendation text check (recommendation in ('BUY', $$DON'T BUY$$, 'ONLY IF')),
  created_at timestamptz not null default now()
);

create index idx_product_checks_user on public.product_checks(user_id);
create index idx_product_checks_created on public.product_checks(created_at desc);
create index idx_product_checks_score on public.product_checks(score);

-- ============================================================================
-- rate_limits - IP-based rate limiting for anonymous users
-- ============================================================================
create table public.rate_limits (
  id uuid primary key default uuid_generate_v4(),
  ip_address text not null,
  date date not null default current_date,
  count integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index idx_rate_limits_ip_date on public.rate_limits(ip_address, date);

-- ============================================================================
-- usage_tracking - aggregate usage analytics
-- ============================================================================
create table public.usage_tracking (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_usage_tracking_user on public.usage_tracking(user_id);
create index idx_usage_tracking_action on public.usage_tracking(action);

-- ============================================================================
-- affiliate_clicks - track outbound affiliate link clicks
-- ============================================================================
create table public.affiliate_clicks (
  id uuid primary key default uuid_generate_v4(),
  check_id uuid references public.product_checks(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  shop text not null,
  product_name text,
  url text not null,
  created_at timestamptz not null default now()
);

create index idx_affiliate_clicks_check on public.affiliate_clicks(check_id);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- product_checks
alter table public.product_checks enable row level security;

create policy "Users can view own checks"
  on public.product_checks for select
  using (auth.uid() = user_id);

create policy "Users can insert own checks"
  on public.product_checks for insert
  with check (auth.uid() = user_id or user_id is null);

-- rate_limits - service role only (no user access)
alter table public.rate_limits enable row level security;

-- usage_tracking
alter table public.usage_tracking enable row level security;

create policy "Users can view own usage"
  on public.usage_tracking for select
  using (auth.uid() = user_id);

-- affiliate_clicks
alter table public.affiliate_clicks enable row level security;

create policy "Users can view own clicks"
  on public.affiliate_clicks for select
  using (auth.uid() = user_id);

create policy "Anyone can insert clicks"
  on public.affiliate_clicks for insert
  with check (true);

-- ============================================================================
-- Functions & Triggers
-- ============================================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================================================
-- Storage bucket for uploaded images
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Storage policy: anyone can upload (with size/type restrictions handled by bucket config)
create policy "Anyone can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');
