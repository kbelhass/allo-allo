-- ==============================================================================
-- ALLO-ALLO DATABASE SCHEMA (PostgreSQL 16+)
-- Architecture sécurisée conforme RGPD & INPDP (Loi tunisienne sur les données)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Pour calculs de distance géolocalisée

-- ENUMS
CREATE TYPE user_role AS ENUM ('user', 'premium', 'moderator', 'admin');
CREATE TYPE user_status AS ENUM ('local', 'diaspora', 'foreigner');
CREATE TYPE gender_type AS ENUM ('man', 'woman', 'non_binary');
CREATE TYPE swipe_action AS ENUM ('like', 'pass', 'superlike');
CREATE TYPE payment_provider AS ENUM ('d17', 'floussi', 'telco_recharge', 'sobflous', 'credit_card');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'banned');
CREATE TYPE visibility_scope AS ENUM ('everyone', 'diaspora_only', 'locals_only', 'matches_only');

-- 1. USERS TABLE (Authentification et Sécurité de base)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(64),
    role user_role DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    credits_balance INT DEFAULT 50, -- 50 crédits offerts à l'inscription
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES TABLE (Informations publiques et filtres de rencontre)
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(60) NOT NULL,
    birth_date DATE NOT NULL,
    gender gender_type NOT NULL,
    bio TEXT,
    user_status user_status NOT NULL DEFAULT 'local',
    current_city VARCHAR(100) NOT NULL,
    current_country VARCHAR(100) NOT NULL DEFAULT 'Tunisie',
    origin_city VARCHAR(100), -- Ex: Originaire de Djerba, vivant à Paris
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    hide_exact_location BOOLEAN DEFAULT TRUE, -- Affiche la ville uniquement
    discreet_mode BOOLEAN DEFAULT FALSE, -- Visible uniquement pour les profils likés
    visibility_scope visibility_scope DEFAULT 'everyone',
    languages TEXT[] DEFAULT '{"Arabe", "Français"}',
    interests TEXT[] DEFAULT '{}',
    photos TEXT[] NOT NULL DEFAULT '{}', -- URLs S3/MinIO
    video_intro_url TEXT,
    job_title VARCHAR(100),
    education VARCHAR(100),
    boosted_until TIMESTAMP WITH TIME ZONE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. IDENTITY VERIFICATIONS (Selfie + Pièce d'identité)
CREATE TABLE identity_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    selfie_url TEXT NOT NULL,
    id_card_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    moderator_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 4. SWIPES & INTERACTIONS
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swiper_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action swipe_action NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_swipe UNIQUE (swiper_id, target_id)
);

-- 5. MATCHES TABLE
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_match UNIQUE (user1_id, user2_id)
);

-- 6. CHAT MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(20), -- 'text', 'image', 'video', 'voice'
    voice_duration_seconds INT,
    is_ephemeral BOOLEAN DEFAULT FALSE,
    ephemeral_ttl_seconds INT DEFAULT 30,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SHORT VIDEOS (TikTok-like Feed)
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    tags TEXT[] DEFAULT '{}',
    category user_status DEFAULT 'diaspora', -- 'diaspora', 'local', 'foreigner'
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    is_moderated BOOLEAN DEFAULT TRUE,
    moderation_flag VARCHAR(50), -- null, 'flagged_ai', 'flagged_user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. VIDEO COMMENTS & LIKES
CREATE TABLE video_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, video_id)
);

CREATE TABLE video_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. LIVES STREAMING
CREATE TABLE live_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category user_status DEFAULT 'diaspora',
    stream_key VARCHAR(100) UNIQUE NOT NULL,
    playback_url TEXT,
    viewer_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 10. VIRTUAL GIFTS & LIVE INTERACTIONS
CREATE TABLE live_gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    live_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gift_name VARCHAR(50) NOT NULL, -- 'jasmine', 'chechia', 'cafe_direct', 'makroudh', 'royal_camel'
    gift_price_credits INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. MONETIZATION & TRANSACTIONS (Paiements Tunisiens)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider payment_provider NOT NULL,
    reference_id VARCHAR(100) UNIQUE NOT NULL, -- Réf D17 / Floussi / Telco Voucher
    amount_tnd DECIMAL(10, 3) NOT NULL, -- Dinar Tunisien à 3 décimales (ex: 9.990 DT)
    credits_amount INT DEFAULT 0,
    is_subscription BOOLEAN DEFAULT FALSE,
    plan_name VARCHAR(50), -- 'allo_gold_monthly', 'pack_100_credits', etc.
    status payment_status DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 12. MODERATION, REPORTS & BLOCKS
CREATE TABLE user_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status report_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_blocks (
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

-- INDEXATION POUR PERFORMANCES DE RECHERCHE & GÉOLOCALISATION
CREATE INDEX idx_profiles_status ON profiles(user_status);
CREATE INDEX idx_profiles_city ON profiles(current_city);
CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_messages_match ON messages(match_id, created_at DESC);
CREATE INDEX idx_videos_category ON videos(category, created_at DESC);
