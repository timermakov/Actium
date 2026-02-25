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

	// Используем актуальный метод Run
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

	// Миграции
	setupSQL := `
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		role TEXT NOT NULL,
		created_at TIMESTAMPTZ DEFAULT NOW()
	);`
	if _, err = testPool.Exec(ctx, setupSQL); err != nil {
		log.Fatalf("failed to setup schema: %s", err)
	}

	code := m.Run()

	testPool.Close()
	pgContainer.Terminate(ctx)
	os.Exit(code)
}

func TestUserRepository_Create(t *testing.T) {
	t.Parallel()
	repo := NewPostgresUserRepository(testPool)
	ctx := context.Background()

	tests := []struct {
		name    string
		user    *model.User
		wantErr bool
	}{
		{
			name: "1. Success",
			user: &model.User{
				ID:           uuid.New(),
				Email:        fmt.Sprintf("create_%s@test.com", uuid.NewString()[:8]),
				PasswordHash: "hash",
				Role:         "user",
			},
			wantErr: false,
		},
		{
			name: "2. Duplicate Email",
			user: &model.User{
				ID:           uuid.New(),
				Email:        "duplicate@test.com",
				PasswordHash: "hash",
				Role:         "user",
			},
			wantErr: true,
		},
	}

	_ = repo.Create(ctx, &model.User{ID: uuid.New(), Email: "duplicate@test.com", PasswordHash: "h", Role: "u"})

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

	u := &model.User{
		ID:           uuid.New(),
		Email:        fmt.Sprintf("get_%s@test.com", uuid.NewString()[:8]),
		PasswordHash: "hash",
		Role:         "admin",
	}
	_ = repo.Create(ctx, u)

	tests := []struct {
		name string
		run  func(t *testing.T)
	}{
		{
			name: "1. Find by ID",
			run: func(t *testing.T) {
				res, err := repo.GetByID(ctx, u.ID)
				assert.NoError(t, err)
				assert.Equal(t, u.Email, res.Email)
			},
		},
		{
			name: "2. Find by Email",
			run: func(t *testing.T) {
				res, err := repo.GetByEmail(ctx, u.Email)
				assert.NoError(t, err)
				assert.Equal(t, u.ID, res.ID)
			},
		},
		{
			name: "3. Not Found ID",
			run: func(t *testing.T) {
				_, err := repo.GetByID(ctx, uuid.New())
				assert.Error(t, err)
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.run(t)
		})
	}
}

func TestUserRepository_UpdateAndDelete(t *testing.T) {
	t.Parallel()
	repo := NewPostgresUserRepository(testPool)
	ctx := context.Background()

	u := &model.User{
		ID: uuid.New(), Email: "action@test.com", PasswordHash: "old", Role: "user",
	}
	_ = repo.Create(ctx, u)

	t.Run("UpdatePassword", func(t *testing.T) {
		newHash := "new_hashed_pass"
		err := repo.UpdatePassword(ctx, u.ID, newHash)
		assert.NoError(t, err)

		updated, _ := repo.GetByID(ctx, u.ID)
		assert.Equal(t, newHash, updated.PasswordHash)
	})

	t.Run("Delete", func(t *testing.T) {
		err := repo.Delete(ctx, u.ID)
		assert.NoError(t, err)

		_, err = repo.GetByID(ctx, u.ID)
		assert.Error(t, err)
	})
}

func TestUserRepository_List(t *testing.T) {
	t.Parallel()
	repo := NewPostgresUserRepository(testPool)
	ctx := context.Background()

	countBefore, _ := repo.List(ctx)

	for i := 0; i < 2; i++ {
		_ = repo.Create(ctx, &model.User{
			ID: uuid.New(), Email: fmt.Sprintf("list_%d_%s@t.com", i, uuid.NewString()),
			PasswordHash: "h", Role: "u",
		})
	}

	list, err := repo.List(ctx)
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, len(list), len(countBefore)+2)
}
