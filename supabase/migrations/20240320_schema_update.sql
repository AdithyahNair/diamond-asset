-- Drop existing tables
DROP TABLE IF EXISTS minted_emails;
DROP TABLE IF EXISTS user_carts;

-- Create user_profiles table
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    nft_purchases INTEGER[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create minted_nfts table
CREATE TABLE minted_nfts (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    token_id INTEGER NOT NULL,
    minted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email, token_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_minted_nfts_email ON minted_nfts(email);
CREATE INDEX idx_minted_nfts_token_id ON minted_nfts(token_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE minted_nfts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

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