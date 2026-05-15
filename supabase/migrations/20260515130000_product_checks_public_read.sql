-- Allow public read access to product_checks by ID (for shareable result links)
-- Only the result, score, and recommendation columns are exposed via the select in the page

alter table public.product_checks enable row level security;

-- Allow anyone to read a product check by its ID (shared results)
create policy "Public read access for shared results"
  on public.product_checks
  for select
  using (true);
