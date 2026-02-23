package service

import (
	"context"
	"errors"
	"time"
	"user-account/cmd/internal/model"
	"user-account/cmd/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo      repository.UserRepository
	jwtSecret string
}

func NewAuthService(repo repository.UserRepository, secret string) *AuthService {
	return &AuthService{repo: repo, jwtSecret: secret}
}

func (s *AuthService) Register(ctx context.Context, email, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := &model.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: string(hash),
		Role:         "user",
	}

	return s.repo.Create(ctx, user)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, error) {
	user, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	if bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(password),
	) != nil {
		return "", errors.New("invalid credentials")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID.String(),
		"role": user.Role,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
	})

	return token.SignedString([]byte(s.jwtSecret))
}
