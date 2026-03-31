-- ============================================================
-- FedBenefitsAid — Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- --------------------------------------------------------
-- 1. PROFILES
--    Auto-created for every new auth user via trigger.
--    Stores optional profile info and subscription status.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  agency        TEXT,          -- e.g. "Department of Defense"
  hire_year     INT,           -- approximate year hired
  retirement_system TEXT,      -- 'FERS' | 'CSRS' | 'CSRS-Offset'
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only read/write their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- --------------------------------------------------------
-- 2. CONVERSATIONS
--    Each conversation is a session of chat messages.
--    One user can have many conversations.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT DEFAULT 'New Conversation',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id);


-- --------------------------------------------------------
-- 3. MESSAGES
--    Individual chat messages within a conversation.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own messages"
  ON public.messages FOR ALL
  USING (auth.uid() = user_id);

-- Index for fast conversation lookup
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON public.messages(user_id);


-- --------------------------------------------------------
-- 4. LEADS
--    Tracks when someone clicks "Book Free Consultation".
--    Used to measure lead flow and attribution.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT,                  -- null if anonymous visitor
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source        TEXT DEFAULT 'reference_cta',  -- 'reference_cta' | 'chat_cta' | 'landing'
  page_context  TEXT,                  -- e.g. which topic they were reading
  calendly_booked BOOLEAN DEFAULT FALSE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table: only service_role (backend) can write; users can insert their own
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a lead"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);


-- --------------------------------------------------------
-- 5. SUBSCRIPTIONS (for future Stripe integration)
--    Tracks Pro subscription status per user.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id   TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status            TEXT DEFAULT 'free' CHECK (status IN ('free', 'active', 'canceled', 'past_due')),
  plan              TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro_monthly', 'pro_annual')),
  current_period_end TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Auto-create free subscription for every new user
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, status, plan)
  VALUES (NEW.id, 'free', 'free');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_subscription();


-- --------------------------------------------------------
-- Done! You can verify by running:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public';
-- --------------------------------------------------------
