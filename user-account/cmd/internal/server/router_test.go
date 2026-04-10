package router

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"user-account/cmd/internal/gen/mocks" // Убедись, что путь к GoMock правильный
	"user-account/cmd/internal/handler"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestNewRouter(t *testing.T) {
	t.Parallel()

	jwtSecret := "test-secret"

	tests := []struct {
		name           string
		method         string
		url            string
		setupMock      func(ma *mocks.MockAuthProvider, mu *mocks.MockUserProvider)
		expectedStatus int
	}{
		{
			name:           "1. Route GET /health",
			method:         http.MethodGet,
			url:            "/health",
			setupMock:      func(_ *mocks.MockAuthProvider, _ *mocks.MockUserProvider) {},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "2. Route POST /register (Empty Body)",
			method:         http.MethodPost,
			url:            "/register",
			setupMock:      func(_ *mocks.MockAuthProvider, _ *mocks.MockUserProvider) {},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "3. Route GET /users - Unauthorized (Missing JWT)",
			method:         http.MethodGet,
			url:            "/users",
			setupMock:      func(_ *mocks.MockAuthProvider, _ *mocks.MockUserProvider) {},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "4. Route DELETE /users/{id} - Unauthorized",
			method:         http.MethodDelete,
			url:            "/users/550e8400-e29b-41d4-a716-446655440000",
			setupMock:      func(_ *mocks.MockAuthProvider, _ *mocks.MockUserProvider) {},
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl := gomock.NewController(t)

			mockAuthSvc := mocks.NewMockAuthProvider(ctrl)
			mockUserSvc := mocks.NewMockUserProvider(ctrl)

			tt.setupMock(mockAuthSvc, mockUserSvc)

			authHandler := handler.NewAuthHandler(mockAuthSvc)
			userHandler := handler.NewUserHandler(mockUserSvc)
			healthHandler := handler.NewHealthHandler()

			r := NewRouter(healthHandler, authHandler, userHandler, jwtSecret, []string{"http://localhost:5173"})

			req := httptest.NewRequest(tt.method, tt.url, nil)
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
		})
	}
}
