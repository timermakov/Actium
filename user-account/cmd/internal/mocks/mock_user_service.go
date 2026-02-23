package mocks

import (
	"context"
	"user-account/cmd/internal/model"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
)

type MockUserService struct {
	mock.Mock
}

func (m *MockUserService) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockUserService) UpdatePassword(ctx context.Context, id uuid.UUID, password string) error {
	args := m.Called(ctx, id, password)
	return args.Error(0)
}

func (m *MockUserService) List(ctx context.Context) ([]model.User, error) {
	args := m.Called(ctx)
	return args.Get(0).([]model.User), args.Error(1)
}
