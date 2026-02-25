package service

import (
	"context"
	"errors"
	"testing"
	"user-account/cmd/internal/mocks"
	"user-account/cmd/internal/model"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
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
				m.On("UpdatePassword", mock.Anything, userID, mock.MatchedBy(func(hash string) bool {
					err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(newPass))
					return err == nil
				})).Return(nil)
			},
			wantErr: false,
		},
		{
			name:     "2. Repository Error",
			id:       userID,
			password: "any",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.On("UpdatePassword", mock.Anything, mock.Anything, mock.Anything).
					Return(errors.New("db error"))
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

			svc := NewUserService(repo)
			err := svc.UpdatePassword(context.Background(), tt.id, tt.password)

			assert.Equal(t, tt.wantErr, err != nil)
			repo.AssertExpectations(t)
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
				m.On("List", mock.Anything).Return(mockUsers, nil)
			},
			expectedLen: 2,
			wantErr:     false,
		},
		{
			name: "Empty List",
			mockBehavior: func(m *mocks.MockUserRepository) {
				m.On("List", mock.Anything).Return([]model.User{}, nil)
			},
			expectedLen: 0,
			wantErr:     false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			repo := new(mocks.MockUserRepository)
			tt.mockBehavior(repo)

			svc := NewUserService(repo)
			users, err := svc.List(context.Background())

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Len(t, users, tt.expectedLen)
			}
			repo.AssertExpectations(t)
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
				m.On("Delete", mock.Anything, userID).Return(nil)
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			repo := new(mocks.MockUserRepository)
			tt.mockBehavior(repo)

			svc := NewUserService(repo)
			err := svc.Delete(context.Background(), tt.id)

			assert.Equal(t, tt.wantErr, err != nil)
			repo.AssertExpectations(t)
		})
	}
}
