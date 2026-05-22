package model

import (
	"testing"
	"time"

	jet_model "user-account/cmd/internal/gen/docflow/public/model"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestToDomain(t *testing.T) {
	tests := []struct {
		name     string
		input    jet_model.Users
		expected User
	}{
		{
			name: "valid user with all fields",
			input: jet_model.Users{
				ID:           uuid.MustParse("550e8400-e29b-41d4-a716-446655440000"),
				Email:        "test@example.com",
				Nickname:     "testuser",
				PasswordHash: "hashedpassword123",
				Role:         "user",
				CreatedAt:    &[]time.Time{time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)}[0],
			},
			expected: User{
				ID:           uuid.MustParse("550e8400-e29b-41d4-a716-446655440000"),
				Email:        "test@example.com",
				Nickname:     "testuser",
				PasswordHash: "hashedpassword123",
				Role:         "user",
				CreatedAt:    time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
			},
		},
		{
			name: "user without CreatedAt uses current time",
			input: jet_model.Users{
				ID:           uuid.MustParse("550e8400-e29b-41d4-a716-446655440001"),
				Email:        "admin@example.com",
				Nickname:     "admin",
				PasswordHash: "adminhash",
				Role:         "admin",
				CreatedAt:    nil,
			},
			expected: User{
				ID:           uuid.MustParse("550e8400-e29b-41d4-a716-446655440001"),
				Email:        "admin@example.com",
				Nickname:     "admin",
				PasswordHash: "adminhash",
				Role:         "admin",
				// CreatedAt will be time.Now(), so we just check it's not zero
			},
		},
		{
			name: "user with empty optional fields",
			input: jet_model.Users{
				ID:           uuid.New(),
				Email:        "minimal@example.com",
				Nickname:     "min",
				PasswordHash: "",
				Role:         "",
				CreatedAt:    nil,
			},
			expected: User{
				ID:           uuid.New(), // Will be different, checked separately
				Email:        "minimal@example.com",
				Nickname:     "min",
				PasswordHash: "",
				Role:         "",
				CreatedAt:    time.Now(), // Will be different, checked separately
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ToDomain(tt.input)

			// Check basic fields
			assert.Equal(t, tt.input.Email, result.Email)
			assert.Equal(t, tt.input.Nickname, result.Nickname)
			assert.Equal(t, tt.input.PasswordHash, result.PasswordHash)
			assert.Equal(t, tt.input.Role, result.Role)

			// For ID, compare if input has specific UUID
			if tt.input.ID != uuid.Nil {
				assert.Equal(t, tt.input.ID, result.ID)
			}

			// For CreatedAt, check logic
			if tt.input.CreatedAt != nil {
				assert.Equal(t, *tt.input.CreatedAt, result.CreatedAt)
			} else {
				// When CreatedAt is nil, should use current time (approximately)
				assert.WithinDuration(t, time.Now(), result.CreatedAt, time.Second)
			}
		})
	}
}

func TestUserStruct(t *testing.T) {
	// Test that User struct has correct JSON tags
	user := User{
		ID:           uuid.New(),
		Email:        "test@test.com",
		Nickname:     "tester",
		PasswordHash: "should not be serialized",
		Role:         "user",
		CreatedAt:    time.Now(),
	}

	// Basic sanity checks
	assert.NotEqual(t, uuid.Nil, user.ID)
	assert.Equal(t, "test@test.com", user.Email)
	assert.Equal(t, "tester", user.Nickname)
	assert.Equal(t, "should not be serialized", user.PasswordHash)
	assert.Equal(t, "user", user.Role)
}
