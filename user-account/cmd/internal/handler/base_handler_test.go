package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

// Тестовая структура, в которую встроен baseHandler
type testHandler struct {
	baseHandler
}

func TestBaseHandler_WriteJSON(t *testing.T) {
	t.Parallel()
	h := &testHandler{}

	type mockPayload struct {
		Message string `json:"message"`
		ID      int    `json:"id"`
	}

	tests := []struct {
		name           string
		code           int
		payload        interface{}
		expectedBody   string
		expectedStatus int
	}{
		{
			name:           "1. Success OK with struct",
			code:           http.StatusOK,
			payload:        mockPayload{Message: "hello", ID: 1},
			expectedBody:   `{"message":"hello","id":1}`,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "2. Created with map",
			code:           http.StatusCreated,
			payload:        map[string]string{"status": "ok"},
			expectedBody:   `{"status":"ok"}`,
			expectedStatus: http.StatusCreated,
		},
		{
			name:           "3. Empty slice",
			code:           http.StatusOK,
			payload:        []string{},
			expectedBody:   `[]`,
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			w := httptest.NewRecorder()
			h.writeJSON(w, tt.code, tt.payload)

			assert.Equal(t, tt.expectedStatus, w.Code)
			assert.Equal(t, "application/json", w.Header().Get("Content-Type"))
			assert.JSONEq(t, tt.expectedBody, w.Body.String())
		})
	}
}

func TestBaseHandler_WriteError(t *testing.T) {
	t.Parallel()
	h := &testHandler{}

	tests := []struct {
		name           string
		message        string
		code           int
		expectedBody   string
		expectedStatus int
	}{
		{
			name:           "1. Bad Request Error",
			message:        "invalid input",
			code:           http.StatusBadRequest,
			expectedBody:   `{"error":"invalid input"}`,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "2. Internal Server Error",
			message:        "database connection failed",
			code:           http.StatusInternalServerError,
			expectedBody:   `{"error":"database connection failed"}`,
			expectedStatus: http.StatusInternalServerError,
		},
		{
			name:           "3. Unauthorized Error",
			message:        "token expired",
			code:           http.StatusUnauthorized,
			expectedBody:   `{"error":"token expired"}`,
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			w := httptest.NewRecorder()
			h.writeError(w, tt.message, tt.code)

			assert.Equal(t, tt.expectedStatus, w.Code)
			assert.Equal(t, "application/json", w.Header().Get("Content-Type"))

			var resp map[string]string
			err := json.Unmarshal(w.Body.Bytes(), &resp)
			assert.NoError(t, err)
			assert.Equal(t, tt.message, resp["error"])
		})
	}
}
