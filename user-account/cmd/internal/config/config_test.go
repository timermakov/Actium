package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoad(t *testing.T) {
	validEnv := map[string]string{
		"APP_HOST":             "localhost",
		"APP_PORT":             "8080",
		"DB_HOST":              "localhost",
		"DB_PORT":              "5432",
		"DB_USER":              "postgres",
		"DB_PASSWORD":          "password",
		"DB_NAME":              "docflow",
		"JWT_SECRET":           "secret",
		"CORS_ALLOWED_ORIGINS": "http://localhost:5173,http://127.0.0.1:5173",
	}

	tests := []struct {
		name        string
		overrideEnv map[string]string
		expectPanic bool
	}{
		{
			name:        "valid config",
			overrideEnv: map[string]string{},
			expectPanic: false,
		},
		{
			name: "missing APP_PORT",
			overrideEnv: map[string]string{
				"APP_PORT": "",
			},
			expectPanic: true,
		},
		{
			name: "invalid APP_PORT",
			overrideEnv: map[string]string{
				"APP_PORT": "abc",
			},
			expectPanic: true,
		},
		{
			name: "missing multiple fields",
			overrideEnv: map[string]string{
				"APP_PORT":   "",
				"DB_HOST":    "",
				"JWT_SECRET": "",
			},
			expectPanic: true,
		},
		{
			name: "missing CORS_ALLOWED_ORIGINS",
			overrideEnv: map[string]string{
				"CORS_ALLOWED_ORIGINS": "",
			},
			expectPanic: true,
		},
	}

	for _, tt := range tests {
		tt := tt

		t.Run(tt.name, func(t *testing.T) {
			for k, v := range validEnv {
				t.Setenv(k, v)
			}

			for k, v := range tt.overrideEnv {
				t.Setenv(k, v)
			}

			if tt.expectPanic {
				assert.Panics(t, func() {
					Load()
				})
				return
			}

			cfg := Load()

			assert.Equal(t, "8080", cfg.AppPort)
			assert.Equal(t, "localhost", cfg.DBHost)
			assert.Equal(t, []string{"http://localhost:5173", "http://127.0.0.1:5173"}, cfg.CORSAllowedOrigins)

			expectedURL := "postgres://postgres:password@localhost:5432/docflow?sslmode=disable"
			assert.Equal(t, expectedURL, cfg.DBUrl)
		})
	}
}

func TestValidate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		config    Config
		wantError bool
	}{
		{
			name: "valid config",
			config: Config{
				AppHost:            "localhost",
				AppPort:            "8080",
				DBHost:             "localhost",
				DBPort:             "5432",
				DBUser:             "postgres",
				DBPassword:         "password",
				DBName:             "docflow",
				JWTSecret:          "secret",
				CORSAllowedOrigins: []string{"http://localhost:5173"},
			},
			wantError: false,
		},
		{
			name: "invalid port",
			config: Config{
				AppHost:            "localhost",
				AppPort:            "abc",
				DBHost:             "localhost",
				DBPort:             "5432",
				DBUser:             "postgres",
				DBPassword:         "password",
				DBName:             "docflow",
				JWTSecret:          "secret",
				CORSAllowedOrigins: []string{"http://localhost:5173"},
			},
			wantError: true,
		},
		{
			name:      "missing fields",
			config:    Config{},
			wantError: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			errs := tt.config.Validate()
			assert.Equal(t, tt.wantError, len(errs) > 0)
		})
	}
}
