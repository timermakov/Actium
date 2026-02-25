package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"user-account/cmd/internal/mocks"
	"user-account/cmd/internal/model"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestUserHandler_UpdatePassword(t *testing.T) {
	t.Parallel()

	userID := uuid.New()

	tests := []struct {
		name           string
		id             uuid.UUID
		requestBody    interface{}
		mockBehavior   func(m *mocks.MockUserService)
		expectedStatus int
	}{
		{
			name:        "Success Update",
			id:          userID,
			requestBody: map[string]string{"new_password": "secure-pass"},
			mockBehavior: func(m *mocks.MockUserService) {
				m.On("UpdatePassword", mock.Anything, userID, "secure-pass").Return(nil)
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:        "Internal Error",
			id:          userID,
			requestBody: map[string]string{"new_password": "pass"},
			mockBehavior: func(m *mocks.MockUserService) {
				m.On("UpdatePassword", mock.Anything, userID, "pass").Return(errors.New("db error"))
			},
			expectedStatus: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockSvc := new(mocks.MockUserService)
			tt.mockBehavior(mockSvc)
			h := NewUserHandler(mockSvc)

			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPatch, "/users/"+tt.id.String()+"/password", bytes.NewBuffer(body))
			w := httptest.NewRecorder()

			h.UpdatePassword(w, req, tt.id)

			assert.Equal(t, tt.expectedStatus, w.Code)
			mockSvc.AssertExpectations(t)
		})
	}
}

func TestUserHandler_List(t *testing.T) {
	t.Parallel()

	mockUsers := []model.User{
		{ID: uuid.New(), Email: "one@test.com"},
		{ID: uuid.New(), Email: "two@test.com"},
	}

	tests := []struct {
		name           string
		mockBehavior   func(m *mocks.MockUserService)
		expectedStatus int
		checkResponse  bool
	}{
		{
			name: "Success List",
			mockBehavior: func(m *mocks.MockUserService) {
				m.On("List", mock.Anything).Return(mockUsers, nil)
			},
			expectedStatus: http.StatusOK,
			checkResponse:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockSvc := new(mocks.MockUserService)
			tt.mockBehavior(mockSvc)
			h := NewUserHandler(mockSvc)

			req := httptest.NewRequest(http.MethodGet, "/users", nil)
			w := httptest.NewRecorder()

			h.List(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.checkResponse {
				var resp []model.User
				err := json.NewDecoder(w.Body).Decode(&resp)
				if err != nil {
					t.Fatalf("Error decoding response body: %s", err)
				}
				assert.Len(t, resp, 2)
				assert.Equal(t, mockUsers[0].Email, resp[0].Email)
			}
		})
	}
}
