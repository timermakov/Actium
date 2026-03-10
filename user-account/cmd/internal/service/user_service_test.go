package service

import (
	"context"
	"errors"
	"testing"
	"user-account/cmd/internal/gen/mocks"
	"user-account/cmd/internal/model"

	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func TestUserService_UpdatePassword(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	newPass := "new-secure-password"

	tests := []struct {
		name         string
		id           uuid.UUID
		password     string
		mockBehavior func(m *mocks.MockUserRepository)
		wantErr      bool
	}{
		{
			name:     "1. Success Update",
			id:       userID,
			password: newPass,
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					UpdatePassword(gomock.Any(), userID, gomock.Any()).
					DoAndReturn(func(ctx context.Context, id uuid.UUID, hash string) error {
						err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(newPass))
						assert.NoError(t, err)
						return nil
					})
			},
			wantErr: false,
		},
		{
			name:     "2. Repository Error",
			id:       userID,
			password: "any-password",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					UpdatePassword(gomock.Any(), gomock.Any(), gomock.Any()).
					Return(errors.New("db error"))
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl := gomock.NewController(t)
			repo := mocks.NewMockUserRepository(ctrl)
			tt.mockBehavior(repo)

			svc := NewUserService(repo)
			err := svc.UpdatePassword(context.Background(), tt.id, tt.password)
			assert.Equal(t, tt.wantErr, err != nil)
		})
	}
}

func TestUserService_List(t *testing.T) {
	t.Parallel()

	mockUsers := []model.User{
		{ID: uuid.New(), Email: "user1@test.com"},
		{ID: uuid.New(), Email: "user2@test.com"},
	}

	tests := []struct {
		name         string
		mockBehavior func(m *mocks.MockUserRepository)
		expectedLen  int
		wantErr      bool
	}{
		{
			name: "Success Get List",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					List(gomock.Any()).
					Return(mockUsers, nil)
			},
			expectedLen: 2,
			wantErr:     false,
		},
		{
			name: "Empty List",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					List(gomock.Any()).
					Return([]model.User{}, nil)
			},
			expectedLen: 0,
			wantErr:     false,
		},
		{
			name: "Repository Error",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					List(gomock.Any()).
					Return(nil, errors.New("query error"))
			},
			expectedLen: 0,
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl := gomock.NewController(t)
			repo := mocks.NewMockUserRepository(ctrl)
			tt.mockBehavior(repo)

			svc := NewUserService(repo)
			users, err := svc.List(context.Background())

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Len(t, users, tt.expectedLen)
			}
		})
	}
}

func TestUserService_Delete(t *testing.T) {
	t.Parallel()

	userID := uuid.New()

	tests := []struct {
		name         string
		id           uuid.UUID
		mockBehavior func(m *mocks.MockUserRepository)
		wantErr      bool
	}{
		{
			name: "Success Delete",
			id:   userID,
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					Delete(gomock.Any(), userID).
					Return(nil)
			},
			wantErr: false,
		},
		{
			name: "Delete Not Found or Error",
			id:   userID,
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.EXPECT().
					Delete(gomock.Any(), userID).
					Return(errors.New("user not found"))
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctrl := gomock.NewController(t)
			repo := mocks.NewMockUserRepository(ctrl)
			tt.mockBehavior(repo)

			svc := NewUserService(repo)
			err := svc.Delete(context.Background(), tt.id)
			assert.Equal(t, tt.wantErr, err != nil)
		})
	}
}
