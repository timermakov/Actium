package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
	"user-account/cmd/internal/model"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestJWTAuth(t *testing.T) {
	t.Parallel()

	secret := "test-secret"
	userID := uuid.New()

	createToken := func(id string, role string, exp time.Duration) string {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":  id,
			"role": role,
			"exp":  time.Now().Add(exp).Unix(),
		})
		s, _ := token.SignedString([]byte(secret))
		return s
	}

	tests := []struct {
		name           string
		authHeader     string
		expectedStatus int
		expectedUser   *model.User
	}{
		{
			name:           "1. Valid Token",
			authHeader:     "Bearer " + createToken(userID.String(), "admin", time.Hour),
			expectedStatus: http.StatusOK,
			expectedUser: &model.User{
				ID:   userID,
				Role: "admin",
			},
		},
		{
			name:           "2. Expired Token",
			authHeader:     "Bearer " + createToken(userID.String(), "user", -time.Hour),
			expectedStatus: http.StatusUnauthorized,
			expectedUser:   nil,
		},
		{
			name:           "3. Missing Header",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
			expectedUser:   nil,
		},
		{
			name:           "4. Invalid Format (No Bearer)",
			authHeader:     "Token " + createToken(userID.String(), "user", time.Hour),
			expectedStatus: http.StatusUnauthorized,
			expectedUser:   nil,
		},
		{
			name:           "5. Invalid UUID in Token",
			authHeader:     "Bearer " + createToken("not-a-uuid", "user", time.Hour),
			expectedStatus: http.StatusUnauthorized,
			expectedUser:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				user := UserFromContext(r.Context())
				if tt.expectedUser != nil {
					assert.NotNil(t, user)
					assert.Equal(t, tt.expectedUser.ID, user.ID)
					assert.Equal(t, tt.expectedUser.Role, user.Role)
				}
				w.WriteHeader(http.StatusOK)
			})

			mdw := JWTAuth(secret)(nextHandler)

			req := httptest.NewRequest(http.MethodGet, "/protected", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}
			rec := httptest.NewRecorder()

			mdw.ServeHTTP(rec, req)
			assert.Equal(t, tt.expectedStatus, rec.Code)
		})
	}
}
