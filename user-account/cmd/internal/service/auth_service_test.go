package service

import (
	"context"
	"errors"
	"testing"
	"user-account/cmd/internal/gen/mocks"
	"user-account/cmd/internal/model"

	"github.com/golang-jwt/jwt/v5"
	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func TestAuthService_Register(t *testing.T) {
	t.Parallel()

	const (
		email    = "new@example.com"
		password = "securepassword"
		nickname = "wanderer"
	)

	tests := []struct {
		name         string
		mockBehavior func(m *mocks.MockUserRepository)
		wantErr      bool
	}{
		{
			name: "Success Registration",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					Create(gomock.Any(), gomock.Any()).
					DoAndReturn(func(ctx context.Context, u *model.User) error {
						assert.Equal(t, email, u.Email)
						assert.Equal(t, nickname, u.Nickname)
						err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
						assert.NoError(t, err)
						return nil
					})
			},
			wantErr: false,
		},
		{
			name: "DB Error",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					Create(gomock.Any(), gomock.Any()).
					Return(errors.New("db connection lost"))
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctrl := gomock.NewController(t)
			repo := mocks.NewMockUserRepository(ctrl)
			tt.mockBehavior(repo)

			svc := NewAuthService(repo, "secret")
			err := svc.Register(context.Background(), email, password, nickname)
			assert.Equal(t, tt.wantErr, err != nil)
		})
	}
}

func TestAuthService_Login(t *testing.T) {
	t.Parallel()

	const secret = "test-jwt-secret"
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
		expectedErr  string
	}{
		{
			name:     "Success Login",
			email:    userEmail,
			password: password,
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					GetByEmail(gomock.Any(), userEmail).
					Return(mockUser, nil)
			},
			wantErr: false,
		},
		{
			name:     "Invalid Password",
			email:    userEmail,
			password: "wrong-password",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					GetByEmail(gomock.Any(), userEmail).
					Return(mockUser, nil)
			},
			wantErr:     true,
			expectedErr: "invalid credentials",
		},
		{
			name:     "User Not Found",
			email:    "unknown@example.com",
			password: "any",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					GetByEmail(gomock.Any(), "unknown@example.com").
					Return(nil, errors.New("not found"))
			},
			wantErr:     true,
			expectedErr: "invalid credentials",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl := gomock.NewController(t)

			repo := mocks.NewMockUserRepository(ctrl)
			tt.mockBehavior(repo)
			svc := NewAuthService(repo, secret)
			token, err := svc.Login(context.Background(), tt.email, tt.password)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Empty(t, token)
				assert.Equal(t, tt.expectedErr, err.Error())
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, token)

				parsedToken, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
					return []byte(secret), nil
				})
				assert.NoError(t, err)

				claims, ok := parsedToken.Claims.(jwt.MapClaims)
				assert.True(t, ok)
				assert.Equal(t, userID.String(), claims["sub"])
				assert.Equal(t, "admin", claims["role"])
			}
		})
	}
}
