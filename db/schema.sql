-- Supabase Schema for LinkMonitor.io

-- USERS
-- Supabase handles user authentication via the `auth.users` table.
-- We create a `profiles` table to store public user data and link it to `auth.users`.
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  PRIMARY KEY (id)
);
-- Function to create a profile when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;
-- Trigger to call the function
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- SUBSCRIPTIONS
-- Stores subscription information for each user, linked to Stripe.
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY REFERENCES public.profiles,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT, -- e.g., 'hobby', 'pro'
  status TEXT, -- e.g., 'active', 'canceled', 'past_due'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- LINKS
-- Stores the affiliate links that users want to monitor.
CREATE TABLE public.links (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
-- Policy: Users can only see their own links.
CREATE POLICY "user_can_see_own_links" ON public.links FOR SELECT
  USING (auth.uid() = user_id);
-- Policy: Users can insert links for themselves.
CREATE POLICY "user_can_insert_own_links" ON public.links FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- Policy: Users can update their own links.
CREATE POLICY "user_can_update_own_links" ON public.links FOR UPDATE
  USING (auth.uid() = user_id);
-- Policy: Users can delete their own links.
CREATE POLICY "user_can_delete_own_links" ON public.links FOR DELETE
  USING (auth.uid() = user_id);


-- SCAN_RESULTS
-- Stores the results of each scan for each link.
CREATE TABLE public.scan_results (
  id BIGSERIAL PRIMARY KEY,
  link_id BIGINT NOT NULL REFERENCES public.links ON DELETE CASCADE,
  status_code INT,
  status_text TEXT,
  is_out_of_stock BOOLEAN DEFAULT FALSE,
  scanned_at TIMESTAMPTZ DEFAULT now()
);
-- Enable Row Level Security
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
-- Policy: Users can only see scan results for their own links.
CREATE POLICY "user_can_see_scan_results_for_own_links" ON public.scan_results FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM public.links WHERE id = link_id));
