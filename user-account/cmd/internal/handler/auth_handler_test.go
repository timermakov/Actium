package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"user-account/cmd/internal/mocks"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestAuthHandler_Login(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		method         string
		requestBody    interface{}
		mockBehavior   func(m *mocks.MockAuthService)
		expectedStatus int
		expectedBody   string
	}{
		{
			name:   "1. Success Login",
			method: http.MethodPost,
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "password123",
			},
			mockBehavior: func(m *mocks.MockAuthService) {
				m.On("Login", mock.Anything, "test@example.com", "password123").
					Return("fake-jwt-token", nil)
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `{"token":"fake-jwt-token"}`,
		},
		{
			name:   "2. Invalid Credentials",
			method: http.MethodPost,
			requestBody: map[string]string{
				"email":    "wrong@test.com",
				"password": "wrong",
			},
			mockBehavior: func(m *mocks.MockAuthService) {
				m.On("Login", mock.Anything, "wrong@test.com", "wrong").
					Return("", errors.New("auth failed"))
			},
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   "invalid credentials",
		},
		{
			name:           "3. Method Not Allowed",
			method:         http.MethodGet,
			requestBody:    nil,
			mockBehavior:   func(_ *mocks.MockAuthService) {},
			expectedStatus: http.StatusMethodNotAllowed,
			expectedBody:   "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockService := new(mocks.MockAuthService)
			tt.mockBehavior(mockService)

			h := NewAuthHandler(mockService)

			var body []byte
			if tt.requestBody != nil {
				body, _ = json.Marshal(tt.requestBody)
			}
			req := httptest.NewRequest(tt.method, "/login", bytes.NewBuffer(body))
			w := httptest.NewRecorder()

			h.Login(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.expectedBody != "" {
				assert.Contains(t, w.Body.String(), tt.expectedBody)
			}

			mockService.AssertExpectations(t)
		})
	}
}

func TestAuthHandler_Register(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		requestBody    map[string]string
		mockBehavior   func(m *mocks.MockAuthService)
		expectedStatus int
	}{
		{
			name: "1. Success Registration",
			requestBody: map[string]string{
				"email":    "new@user.com",
				"password": "password123",
			},
			mockBehavior: func(m *mocks.MockAuthService) {
				m.On("Register", mock.Anything, "new@user.com", "password123").
					Return(nil)
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name: "2. Service Error (User Exists)",
			requestBody: map[string]string{
				"email":    "exists@user.com",
				"password": "password123",
			},
			mockBehavior: func(m *mocks.MockAuthService) {
				m.On("Register", mock.Anything, "exists@user.com", "password123").
					Return(errors.New("user already exists"))
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockSvc := new(mocks.MockAuthService)
			tt.mockBehavior(mockSvc)
			h := NewAuthHandler(mockSvc)

			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
			w := httptest.NewRecorder()

			h.Register(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			mockSvc.AssertExpectations(t)
		})
	}
}
