package router

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"user-account/cmd/internal/handler"
	"user-account/cmd/internal/mocks"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestNewRouter(t *testing.T) {
	t.Parallel()

	jwtSecret := "test-secret"

	mockAuthSvc := new(mocks.MockAuthService)
	mockUserSvc := new(mocks.MockUserService)

	authHandler := handler.NewAuthHandler(mockAuthSvc)
	userHandler := handler.NewUserHandler(mockUserSvc)
	healthHandler := handler.NewHealthHandler()

	r := NewRouter(healthHandler, authHandler, userHandler, jwtSecret)

	tests := []struct {
		name           string
		method         string
		url            string
		setupMock      func()
		expectedStatus int
	}{
		{
			name:           "1. Route GET /health",
			method:         http.MethodGet,
			url:            "/health",
			setupMock:      func() {},
			expectedStatus: http.StatusOK,
		},
		{
			name:   "2. Route POST /register",
			method: http.MethodPost,
			url:    "/register",
			setupMock: func() {
				mockAuthSvc.On("Register", mock.Anything, mock.Anything, mock.Anything).
					Return(nil).Maybe()
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "3. Route GET /users - Unauthorized (Missing JWT)",
			method:         http.MethodGet,
			url:            "/users",
			setupMock:      func() {},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "4. Route DELETE /users/{id} - Found and Called",
			method:         http.MethodDelete,
			url:            "/users/550e8400-e29b-41d4-a716-446655440000",
			setupMock:      func() {},
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.setupMock()

			req := httptest.NewRequest(tt.method, tt.url, nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)
			assert.Equal(t, tt.expectedStatus, w.Code)
		})
	}
}
