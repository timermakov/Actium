package handler

import (
	"errors"
	"net/mail"
	"strings"
)

// RegisterRequest — DTO для регистрации
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Nickname string `json:"nickname"`
}

func (r *RegisterRequest) Validate() error {
	r.Email = strings.TrimSpace(r.Email)
	r.Nickname = strings.TrimSpace(r.Nickname)

	if r.Email == "" {
		return errors.New("email is required")
	}
	if _, err := mail.ParseAddress(r.Email); err != nil {
		return errors.New("invalid email format")
	}
	if len(r.Nickname) < 3 || len(r.Nickname) > 30 {
		return errors.New("nickname must be between 3 and 30 characters")
	}
	if len(r.Password) < 6 {
		return errors.New("password must be at least 6 characters long")
	}
	return nil
}

// LoginRequest — DTO для входа
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (r *LoginRequest) Validate() error {
	if strings.TrimSpace(r.Email) == "" {
		return errors.New("email is required")
	}
	if r.Password == "" {
		return errors.New("password is required")
	}
	return nil
}

// UpdatePasswordRequest - DTO для обновления пароля
type UpdatePasswordRequest struct {
	NewPassword string `json:"new_password"`
}

func (r *UpdatePasswordRequest) Validate() error {
	r.NewPassword = strings.TrimSpace(r.NewPassword)
	if len(r.NewPassword) < 6 {
		return errors.New("new password must be at least 6 characters long")
	}
	return nil
}
