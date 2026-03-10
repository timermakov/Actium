package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"user-account/cmd/internal/gen/mocks"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestAuthHandler_Login(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		requestBody    interface{}
		mockBehavior   func(m *mocks.MockAuthProvider)
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "1. Success Login",
			requestBody: LoginRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			mockBehavior: func(m *mocks.MockAuthProvider) {
				m.EXPECT().
					Login(gomock.Any(), "test@example.com", "password123").
					Return("fake-jwt-token", nil)
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `"token":"fake-jwt-token"`,
		},
		{
			name: "2. Invalid Credentials",
			requestBody: LoginRequest{
				Email:    "wrong@test.com",
				Password: "wrong_password",
			},
			mockBehavior: func(m *mocks.MockAuthProvider) {
				m.EXPECT().
					Login(gomock.Any(), "wrong@test.com", "wrong_password").
					Return("", errors.New("auth failed"))
			},
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   `"error":"Invalid credentials"`,
		},
		{
			name: "3. Validation Error (Empty Email)",
			requestBody: LoginRequest{
				Email:    "",
				Password: "password123",
			},
			mockBehavior:   func(m *mocks.MockAuthProvider) {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error":"email is required"`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctrl := gomock.NewController(t)
			mockSvc := mocks.NewMockAuthProvider(ctrl)
			tt.mockBehavior(mockSvc)

			h := NewAuthHandler(mockSvc)

			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			h.Login(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.expectedBody != "" {
				assert.Contains(t, w.Body.String(), tt.expectedBody)
			}
		})
	}
}

func TestAuthHandler_Register(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		requestBody    interface{}
		mockBehavior   func(m *mocks.MockAuthProvider)
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "1. Success Registration",
			requestBody: RegisterRequest{
				Email:    "new@user.com",
				Password: "password123",
				Nickname: "cool_user",
			},
			mockBehavior: func(m *mocks.MockAuthProvider) {
				m.EXPECT().
					Register(gomock.Any(), "new@user.com", "password123", "cool_user").
					Return(nil)
			},
			expectedStatus: http.StatusCreated,
			expectedBody:   `"status":"ok"`,
		},
		{
			name: "2. Validation Error (Short Password)",
			requestBody: RegisterRequest{
				Email:    "test@user.com",
				Password: "123",
				Nickname: "nick",
			},
			mockBehavior:   func(m *mocks.MockAuthProvider) {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error":"password must be at least 6 characters long"`,
		},
		{
			name: "3. Service Error (User Exists)",
			requestBody: RegisterRequest{
				Email:    "exists@user.com",
				Password: "password123",
				Nickname: "exists_nick",
			},
			mockBehavior: func(m *mocks.MockAuthProvider) {
				m.EXPECT().
					Register(gomock.Any(), "exists@user.com", "password123", "exists_nick").
					Return(errors.New("user already exists"))
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error":"user already exists"`,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			mockSvc := mocks.NewMockAuthProvider(ctrl)
			tt.mockBehavior(mockSvc)

			h := NewAuthHandler(mockSvc)

			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			h.Register(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.expectedBody != "" {
				assert.Contains(t, w.Body.String(), tt.expectedBody)
			}
		})
	}
}
