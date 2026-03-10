package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"user-account/cmd/internal/gen/mocks"
	"user-account/cmd/internal/model"

	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestUserHandler_UpdatePassword(t *testing.T) {
	t.Parallel()

	userID := uuid.New()

	tests := []struct {
		name           string
		id             uuid.UUID
		requestBody    interface{}
		mockBehavior   func(m *mocks.MockUserProvider)
		expectedStatus int
		expectedBody   string
	}{
		{
			name:        "Success Update",
			id:          userID,
			requestBody: UpdatePasswordRequest{NewPassword: "secure-password-123"},
			mockBehavior: func(m *mocks.MockUserProvider) {
				m.EXPECT().
					UpdatePassword(gomock.Any(), userID, "secure-password-123").
					Return(nil)
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `"status":"password updated"`,
		},
		{
			name:           "Validation Error (Too Short)",
			id:             userID,
			requestBody:    UpdatePasswordRequest{NewPassword: "123"},
			mockBehavior:   func(_ *mocks.MockUserProvider) {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error":"new password must be at least 6 characters long"`,
		},
		{
			name:        "Service Internal Error",
			id:          userID,
			requestBody: UpdatePasswordRequest{NewPassword: "valid-password"},
			mockBehavior: func(m *mocks.MockUserProvider) {
				m.EXPECT().
					UpdatePassword(gomock.Any(), userID, "valid-password").
					Return(errors.New("db error"))
			},
			expectedStatus: http.StatusInternalServerError,
			expectedBody:   `"error":"db error"`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl := gomock.NewController(t)
			mockSvc := mocks.NewMockUserProvider(ctrl)
			tt.mockBehavior(mockSvc)

			h := NewUserHandler(mockSvc)

			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest(http.MethodPatch, "/users/"+tt.id.String(), bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			h.UpdatePassword(w, req, tt.id)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.expectedBody != "" {
				assert.Contains(t, w.Body.String(), tt.expectedBody)
			}
		})
	}
}

func TestUserHandler_List(t *testing.T) {
	t.Parallel()

	type userResponse struct {
		ID        uuid.UUID `json:"id"`
		Email     string    `json:"email"`
		Nickname  string    `json:"nickname"`
		Role      string    `json:"role"`
		CreatedAt string    `json:"created_at"`
	}

	tests := []struct {
		name           string
		mockUsers      []model.User
		mockErr        error
		expectedStatus int
		checkResponse  bool
	}{
		{
			name: "Success List",
			mockUsers: []model.User{
				{
					ID:       uuid.New(),
					Email:    "one@test.com",
					Nickname: "nick1",
					Role:     "user",
				},
				{
					ID:       uuid.New(),
					Email:    "two@test.com",
					Nickname: "nick2",
					Role:     "admin",
				},
			},
			mockErr:        nil,
			expectedStatus: http.StatusOK,
			checkResponse:  true,
		},
		{
			name:           "Internal Server Error",
			mockUsers:      nil,
			mockErr:        errors.New("db failure"),
			expectedStatus: http.StatusInternalServerError,
			checkResponse:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctrl := gomock.NewController(t)

			mockSvc := mocks.NewMockUserProvider(ctrl)
			mockSvc.EXPECT().
				List(gomock.Any()).
				Return(tt.mockUsers, tt.mockErr).
				Times(1)

			h := NewUserHandler(mockSvc)

			req := httptest.NewRequest(http.MethodGet, "/users", nil)
			w := httptest.NewRecorder()

			h.List(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.checkResponse {
				var resp []userResponse
				err := json.NewDecoder(w.Body).Decode(&resp)

				assert.NoError(t, err, "JSON decoding failed")
				assert.Equal(t, len(tt.mockUsers), len(resp), "User list length mismatch")

				assert.Equal(t, tt.mockUsers[0].ID, resp[0].ID)
				assert.Equal(t, tt.mockUsers[0].Email, resp[0].Email)
				assert.Equal(t, tt.mockUsers[0].Nickname, resp[0].Nickname)
				assert.Equal(t, tt.mockUsers[0].Role, resp[0].Role)
				assert.NotEmpty(t, resp[0].CreatedAt)
			}
		})
	}
}
