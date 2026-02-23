package middleware

import (
	"context"
	"net/http"
	"strings"
	"user-account/cmd/internal/model"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type contextKey string

const userCtxKey = contextKey("user")

// JWTAuth проверяет токен и добавляет пользователя в контекст
func JWTAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				http.Error(w, "Invalid authorization header", http.StatusUnauthorized)
				return
			}

			tokenStr := parts[1]

			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrTokenMalformed
				}
				return []byte(secret), nil
			})
			if err != nil || !token.Valid {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				http.Error(w, "Invalid token claims", http.StatusUnauthorized)
				return
			}

			subRaw, ok := claims["sub"].(string)
			if !ok {
				http.Error(w, "Invalid token sub claim", http.StatusUnauthorized)
				return
			}

			userID, err := uuid.Parse(subRaw)
			if err != nil {
				http.Error(w, "Invalid user ID in token", http.StatusUnauthorized)
				return
			}

			role, _ := claims["role"].(string) // если нет роли — будет пустая строка

			ctx := context.WithValue(r.Context(), userCtxKey, &model.User{
				ID:   userID,
				Role: role,
			})

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// UserFromContext возвращает пользователя из контекста, если он есть
func UserFromContext(ctx context.Context) *model.User {
	u, _ := ctx.Value(userCtxKey).(*model.User)
	return u
}
