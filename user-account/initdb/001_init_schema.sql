CREATE TABLE IF NOT EXISTS users
(
    id            UUID PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    nickname      TEXT UNIQUE NOT NULL,
    password_hash TEXT        NOT NULL,
    role          TEXT        NOT NULL DEFAULT 'user',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
