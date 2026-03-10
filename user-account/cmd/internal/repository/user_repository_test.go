package repository

import (
	"context"
	"fmt"
	"log"
	"os"
	"testing"
	"time"
	"user-account/cmd/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/assert"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

var testPool *pgxpool.Pool

func TestMain(m *testing.M) {
	ctx := context.Background()

	pgContainer, err := postgres.Run(ctx,
		"postgres:16-alpine",
		postgres.WithDatabase("testdb"),
		postgres.WithUsername("user"),
		postgres.WithPassword("pass"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(30*time.Second)),
	)
	if err != nil {
		log.Fatalf("failed to start container: %s", err)
	}

	connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		log.Fatalf("failed to get connection string: %s", err)
	}

	testPool, err = pgxpool.New(ctx, connStr)
	if err != nil {
		log.Fatalf("failed to connect to db: %s", err)
	}

	// Схема должна СТРОГО соответствовать коду репозитория (Jet)
	setupSQL := `
    CREATE TABLE IF NOT EXISTS users (
       id            UUID PRIMARY KEY,
       email         TEXT UNIQUE NOT NULL,
       nickname      TEXT UNIQUE NOT NULL,
       password_hash TEXT NOT NULL,
       role          TEXT NOT NULL,
       created_at    TIMESTAMPTZ DEFAULT NOW()
    );`
	if _, err = testPool.Exec(ctx, setupSQL); err != nil {
		log.Fatalf("failed to setup schema: %s", err)
	}

	code := m.Run()

	testPool.Close()
	_ = pgContainer.Terminate(ctx)
	os.Exit(code)
}

func TestUserRepository_Create(t *testing.T) {
	t.Parallel()
	repo := NewPostgresUserRepository(testPool)
	ctx := context.Background()

	existingEmail := "existing@test.com"
	existingNick := "existing_nick"
	_ = repo.Create(ctx, &model.User{
		ID:           uuid.New(),
		Email:        existingEmail,
		Nickname:     existingNick,
		PasswordHash: "h",
		Role:         "user",
	})

	tests := []struct {
		name    string
		user    *model.User
		wantErr bool
	}{
		{
			name: "Success Creation",
			user: &model.User{
				ID:           uuid.New(),
				Email:        "new_user@test.com",
				Nickname:     "new_nick",
				PasswordHash: "hash",
				Role:         "user",
			},
			wantErr: false,
		},
		{
			name: "Duplicate Email",
			user: &model.User{
				ID:           uuid.New(),
				Email:        existingEmail,
				Nickname:     "random_nick",
				PasswordHash: "hash",
				Role:         "user",
			},
			wantErr: true,
		},
		{
			name: "Duplicate Nickname",
			user: &model.User{
				ID:           uuid.New(),
				Email:        "another@test.com",
				Nickname:     existingNick,
				PasswordHash: "hash",
				Role:         "user",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := repo.Create(ctx, tt.user)
			assert.Equal(t, tt.wantErr, err != nil)
		})
	}
}

func TestUserRepository_GetMethods(t *testing.T) {
	t.Parallel()
	repo := NewPostgresUserRepository(testPool)
	ctx := context.Background()

	refUser := &model.User{
		ID:           uuid.New(),
		Email:        "find_me@test.com",
		Nickname:     "find_me_nick",
		PasswordHash: "secret_hash",
		Role:         "admin",
	}
	assert.NoError(t, repo.Create(ctx, refUser))

	tests := []struct {
		name      string
		queryType string
		queryVal  interface{}
		wantErr   bool
	}{
		{name: "GetByID Success", queryType: "id", queryVal: refUser.ID, wantErr: false},
		{name: "GetByID Not Found", queryType: "id", queryVal: uuid.New(), wantErr: true},
		{name: "GetByEmail Success", queryType: "email", queryVal: refUser.Email, wantErr: false},
		{name: "GetByEmail Not Found", queryType: "email", queryVal: "none@test.com", wantErr: true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var res *model.User
			var err error

			if tt.queryType == "id" {
				res, err = repo.GetByID(ctx, tt.queryVal.(uuid.UUID))
			} else {
				res, err = repo.GetByEmail(ctx, tt.queryVal.(string))
			}

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, refUser.Email, res.Email)
				assert.Equal(t, refUser.Nickname, res.Nickname)
			}
		})
	}
}

func TestUserRepository_UpdateAndDelete(t *testing.T) {
	repo := NewPostgresUserRepository(testPool)
	ctx := context.Background()

	u := &model.User{
		ID:           uuid.New(),
		Email:        "mutable@test.com",
		Nickname:     "mutable_nick",
		PasswordHash: "old_hash",
		Role:         "user",
	}
	assert.NoError(t, repo.Create(ctx, u))

	t.Run("Update Password Success", func(t *testing.T) {
		newHash := "brand_new_hash"
		err := repo.UpdatePassword(ctx, u.ID, newHash)
		assert.NoError(t, err)

		updated, _ := repo.GetByID(ctx, u.ID)
		assert.Equal(t, newHash, updated.PasswordHash)
	})

	t.Run("Delete User Success", func(t *testing.T) {
		t.Parallel()
		err := repo.Delete(ctx, u.ID)
		assert.NoError(t, err)

		_, err = repo.GetByID(ctx, u.ID)
		assert.Error(t, err, "User should not be found after deletion")
	})
}

func TestUserRepository_List(t *testing.T) {
	t.Parallel()
	repo := NewPostgresUserRepository(testPool)
	ctx := context.Background()

	initialList, _ := repo.List(ctx)
	initialCount := len(initialList)

	for i := 0; i < 3; i++ {
		_ = repo.Create(ctx, &model.User{
			ID:           uuid.New(),
			Email:        fmt.Sprintf("list_%d_%d@test.com", i, time.Now().UnixNano()),
			Nickname:     fmt.Sprintf("nick_%d_%d", i, time.Now().UnixNano()),
			PasswordHash: "h",
			Role:         "u",
		})
	}

	t.Run("Verify List Count and Content", func(t *testing.T) {
		t.Parallel()
		list, err := repo.List(ctx)
		assert.NoError(t, err)
		assert.GreaterOrEqual(t, len(list), initialCount+3)

		for _, user := range list {
			assert.NotEmpty(t, user.ID)
			assert.NotEmpty(t, user.Email)
			assert.NotEmpty(t, user.Nickname)
			assert.False(t, user.CreatedAt.IsZero())
		}
	})
}
