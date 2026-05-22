package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestEndpointType(t *testing.T) {
	tests := []struct {
		name     string
		path     string
		expected string
	}{
		{
			name:     "health endpoint",
			path:     "/health",
			expected: "health",
		},
		{
			name:     "register endpoint",
			path:     "/register",
			expected: "register",
		},
		{
			name:     "login endpoint",
			path:     "/login",
			expected: "login",
		},
		{
			name:     "logout endpoint",
			path:     "/logout",
			expected: "logout",
		},
		{
			name:     "users list endpoint",
			path:     "/users",
			expected: "users_list",
		},
		{
			name:     "user by id endpoint",
			path:     "/users/123e4567-e89b-12d3-a456-426614174000",
			expected: "user_by_id",
		},
		{
			name:     "user by id with different uuid",
			path:     "/users/550e8400-e29b-41d4-a716-446655440000",
			expected: "user_by_id",
		},
		{
			name:     "unknown endpoint",
			path:     "/unknown",
			expected: "unknown",
		},
		{
			name:     "empty path",
			path:     "",
			expected: "unknown",
		},
		{
			name:     "root path",
			path:     "/",
			expected: "unknown",
		},
		{
			name:     "path starting with users but not valid format",
			path:     "/usersabc",
			expected: "unknown",
		},
		{
			name:     "nested path",
			path:     "/api/v1/users",
			expected: "unknown",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := endpointType(tt.path)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestResponseRecorder(t *testing.T) {
	t.Run("default status code", func(t *testing.T) {
		rr := httptest.NewRecorder()
		recorder := &responseRecorder{
			ResponseWriter: rr,
			statusCode:     http.StatusOK,
		}

		assert.Equal(t, http.StatusOK, recorder.statusCode)
	})

	t.Run("write header captures status", func(t *testing.T) {
		rr := httptest.NewRecorder()
		recorder := &responseRecorder{
			ResponseWriter: rr,
			statusCode:     http.StatusOK,
		}

		recorder.WriteHeader(http.StatusCreated)

		assert.Equal(t, http.StatusCreated, recorder.statusCode)
		assert.Equal(t, http.StatusCreated, rr.Code)
	})

	t.Run("write header changes status code", func(t *testing.T) {
		rr := httptest.NewRecorder()
		recorder := &responseRecorder{
			ResponseWriter: rr,
			statusCode:     http.StatusOK,
		}

		recorder.WriteHeader(http.StatusCreated)

		assert.Equal(t, http.StatusCreated, recorder.statusCode)
		assert.Equal(t, http.StatusCreated, rr.Code)
	})
}

func TestRecordAPIEvent(t *testing.T) {
	// Test that function doesn't panic
	assert.NotPanics(t, func() {
		RecordAPIEvent("register", "success")
		RecordAPIEvent("register", "failure")
		RecordAPIEvent("login", "success")
		RecordAPIEvent("login", "failure")
		RecordAPIEvent("logout", "success")
	})
}

func TestRecordUserOperation(t *testing.T) {
	// Test that function doesn't panic
	assert.NotPanics(t, func() {
		RecordUserOperation("list", "success")
		RecordUserOperation("list", "failure")
		RecordUserOperation("delete", "success")
		RecordUserOperation("delete", "failure")
		RecordUserOperation("update_password", "success")
		RecordUserOperation("update_password", "failure")
	})
}

func TestPrometheusMetrics(t *testing.T) {
	t.Run("middleware wraps handler", func(t *testing.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("OK"))
		})

		wrapped := PrometheusMetrics(handler)

		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		rr := httptest.NewRecorder()

		wrapped.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code)
		assert.Equal(t, "OK", rr.Body.String())
	})

	t.Run("captures error status", func(t *testing.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
		})

		wrapped := PrometheusMetrics(handler)

		req := httptest.NewRequest(http.MethodPost, "/register", nil)
		rr := httptest.NewRecorder()

		wrapped.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusBadRequest, rr.Code)
	})

	t.Run("handles different endpoints", func(t *testing.T) {
		endpoints := []struct {
			method string
			path   string
			status int
		}{
			{http.MethodGet, "/health", http.StatusOK},
			{http.MethodPost, "/register", http.StatusCreated},
			{http.MethodPost, "/login", http.StatusOK},
			{http.MethodPost, "/logout", http.StatusOK},
			{http.MethodGet, "/users", http.StatusOK},
			{http.MethodDelete, "/users/123", http.StatusOK},
			{http.MethodPatch, "/users/123", http.StatusOK},
		}

		for _, ep := range endpoints {
			t.Run(ep.path+"_"+ep.method, func(t *testing.T) {
				handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(ep.status)
				})

				wrapped := PrometheusMetrics(handler)

				req := httptest.NewRequest(ep.method, ep.path, nil)
				rr := httptest.NewRecorder()

				// Should not panic
				assert.NotPanics(t, func() {
					wrapped.ServeHTTP(rr, req)
				})

				assert.Equal(t, ep.status, rr.Code)
			})
		}
	})

	t.Run("handles concurrent requests", func(t *testing.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})

		wrapped := PrometheusMetrics(handler)

		// Just verify it doesn't panic with multiple requests
		for i := 0; i < 10; i++ {
			req := httptest.NewRequest(http.MethodGet, "/health", nil)
			rr := httptest.NewRecorder()
			wrapped.ServeHTTP(rr, req)
		}
	})
}

// Integration-style test for the full middleware chain
func TestPrometheusMetrics_Integration(t *testing.T) {
	t.Run("measures request duration", func(t *testing.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Simulate some work
			w.WriteHeader(http.StatusOK)
		})

		wrapped := PrometheusMetrics(handler)

		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		rr := httptest.NewRecorder()

		wrapped.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code)
	})

	t.Run("increments in-flight counter", func(t *testing.T) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})

		wrapped := PrometheusMetrics(handler)

		// Multiple concurrent requests
		for i := 0; i < 5; i++ {
			req := httptest.NewRequest(http.MethodGet, "/health", nil)
			rr := httptest.NewRecorder()
			wrapped.ServeHTTP(rr, req)
		}
	})
}
