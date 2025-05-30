-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables first
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    wallet_address TEXT,
    stripe_customer_id TEXT,
    nft_purchases INTEGER[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS minted_nfts (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    token_id INTEGER NOT NULL,
    minted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email, token_id)
);

CREATE TABLE IF NOT EXISTS nft_purchases (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_email TEXT NOT NULL,
    token_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    wallet_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email, token_id)
);

-- Now safe to drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own minted NFTs" ON minted_nfts;
DROP POLICY IF EXISTS "Users can insert their own minted NFTs" ON minted_nfts;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_user_profiles_user_id;
DROP INDEX IF EXISTS idx_user_profiles_email;
DROP INDEX IF EXISTS idx_minted_nfts_email;
DROP INDEX IF EXISTS idx_minted_nfts_token_id;
DROP INDEX IF EXISTS idx_nft_purchases_user_email;
DROP INDEX IF EXISTS idx_nft_purchases_token_id;
DROP INDEX IF EXISTS idx_nft_purchases_status;

-- Create indexes for better query performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_minted_nfts_email ON minted_nfts(email);
CREATE INDEX idx_minted_nfts_token_id ON minted_nfts(token_id);
CREATE INDEX idx_nft_purchases_user_email ON nft_purchases(user_email);
CREATE INDEX idx_nft_purchases_token_id ON nft_purchases(token_id);
CREATE INDEX idx_nft_purchases_status ON nft_purchases(status);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE minted_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for minted_nfts
CREATE POLICY "Users can view their own minted NFTs"
    ON minted_nfts FOR SELECT
    USING (email IN (
        SELECT email FROM user_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own minted NFTs"
    ON minted_nfts FOR INSERT
    WITH CHECK (email IN (
        SELECT email FROM user_profiles WHERE user_id = auth.uid()
    )); 