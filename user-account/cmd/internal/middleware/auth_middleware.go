package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"user-account/cmd/internal/model"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type contextKey string

const userCtxKey = contextKey("user")

// JSONError отправляет структурированную ошибку (удобно для фронтенда)
func jsonError(w http.ResponseWriter, message string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	// Игнорируем ошибку записи, так как в middleware мы мало что можем сделать
	_, _ = w.Write([]byte(`{"error": "` + message + `"}`))
}

// JWTAuth проверяет токен и добавляет пользователя в контекст
func JWTAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				jsonError(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				jsonError(w, "Invalid authorization format", http.StatusUnauthorized)
				return
			}

			tokenStr := parts[1]

			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, errors.New("unexpected signing method")
				}
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				jsonError(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				jsonError(w, "Invalid token claims", http.StatusUnauthorized)
				return
			}

			subRaw, _ := claims["sub"].(string)
			email, _ := claims["email"].(string)
			nickname, _ := claims["nickname"].(string)
			role, _ := claims["role"].(string)

			userID, err := uuid.Parse(subRaw)
			if err != nil {
				jsonError(w, "Invalid user ID in token", http.StatusUnauthorized)
				return
			}

			user := &model.User{
				ID:       userID,
				Email:    email,
				Nickname: nickname,
				Role:     role,
			}

			ctx := context.WithValue(r.Context(), userCtxKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// UserFromContext возвращает пользователя из контекста
func UserFromContext(ctx context.Context) *model.User {
	u, ok := ctx.Value(userCtxKey).(*model.User)
	if !ok {
		return nil
	}
	return u
}

// AdminOnly пропускает только администраторов
func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := UserFromContext(r.Context())

		if user == nil || user.Role != "admin" {
			jsonError(w, "Forbidden: insufficient permissions", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
