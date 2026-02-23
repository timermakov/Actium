package service

import (
	"context"
	"errors"
	"testing"
	"user-account/cmd/internal/mocks"
	"user-account/cmd/internal/model"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
)

func TestAuthService_Register(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		email        string
		password     string
		mockBehavior func(m *mocks.MockUserRepository)
		wantErr      bool
	}{
		{
			name:     "1. Success Registration",
			email:    "new@example.com",
			password: "securepassword",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.On("Create", mock.Anything, mock.MatchedBy(func(u *model.User) bool {
					err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte("securepassword"))
					return u.Email == "new@example.com" && err == nil
				})).Return(nil)
			},
			wantErr: false,
		},
		{
			name:     "2. DB Error",
			email:    "error@example.com",
			password: "password",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.On("Create", mock.Anything, mock.Anything).Return(errors.New("db connection lost"))
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			repo := new(mocks.MockUserRepository)
			tt.mockBehavior(repo)

			svc := NewAuthService(repo, "secret")
			err := svc.Register(context.Background(), tt.email, tt.password)

			assert.Equal(t, tt.wantErr, err != nil)
			repo.AssertExpectations(t)
		})
	}
}

func TestAuthService_Login(t *testing.T) {
	t.Parallel()

	secret := "test-jwt-secret"
	userEmail := "login@example.com"
	password := "correct-pass"
	userID := uuid.New()

	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	mockUser := &model.User{
		ID:           userID,
		Email:        userEmail,
		PasswordHash: string(hash),
		Role:         "admin",
	}

	tests := []struct {
		name         string
		email        string
		password     string
		mockBehavior func(m *mocks.MockUserRepository)
		wantErr      bool
		checkJWT     bool
	}{
		{
			name:     "1. Success Login",
			email:    userEmail,
			password: password,
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.On("GetByEmail", mock.Anything, userEmail).Return(mockUser, nil)
			},
			wantErr:  false,
			checkJWT: true,
		},
		{
			name:     "2. Invalid Password",
			email:    userEmail,
			password: "wrong-password",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.On("GetByEmail", mock.Anything, userEmail).Return(mockUser, nil)
			},
			wantErr: true,
		},
		{
			name:     "3. User Not Found",
			email:    "unknown@example.com",
			password: "any",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.On("GetByEmail", mock.Anything, "unknown@example.com").Return(nil, errors.New("not found"))
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			repo := new(mocks.MockUserRepository)
			tt.mockBehavior(repo)

			svc := NewAuthService(repo, secret)
			token, err := svc.Login(context.Background(), tt.email, tt.password)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Empty(t, token)
				assert.Equal(t, "invalid credentials", err.Error())
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, token)

				if tt.checkJWT {
					parsedToken, _ := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
						return []byte(secret), nil
					})
					claims := parsedToken.Claims.(jwt.MapClaims)
					assert.Equal(t, userID.String(), claims["sub"])
					assert.Equal(t, "admin", claims["role"])
				}
			}
			repo.AssertExpectations(t)
		})
	}
}
