-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN nickname TEXT NOT NULL UNIQUE;

CREATE INDEX idx_users_nickname ON users(nickname);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_users_nickname;
ALTER TABLE users DROP COLUMN IF EXISTS nickname;
-- +goose StatementEnd