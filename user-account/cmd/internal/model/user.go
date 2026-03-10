package model

import (
	"time"
	jet_model "user-account/cmd/internal/gen/docflow/public/model"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	Nickname     string    `json:"nickname"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

// ToDomain - из модельки базы в доменную модель
func ToDomain(u jet_model.Users) User {
	createdAt := time.Now()
	if u.CreatedAt != nil {
		createdAt = *u.CreatedAt
	}
	return User{
		ID:           u.ID,
		Email:        u.Email,
		Nickname:     u.Nickname,
		PasswordHash: u.PasswordHash,
		Role:         u.Role,
		CreatedAt:    createdAt,
	}
}
