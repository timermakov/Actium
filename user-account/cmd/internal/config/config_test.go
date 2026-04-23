package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoad(t *testing.T) {
	// Базовый набор переменных, необходимых для прохождения валидации
	minimalEnv := map[string]string{
		"DB_USER":     "postgres",
		"DB_PASSWORD": "password",
		"DB_NAME":     "docflow",
		"JWT_SECRET":  "secret",
	}

	tests := []struct {
		name        string
		envVars     map[string]string
		expectPanic bool
		check       func(t *testing.T, cfg *Config)
	}{
		{
			name: "full valid config",
			envVars: map[string]string{
				"BACKEND_PORT":         "9090",
				"BACKEND_HOST":         "localhost",
				"DB_HOST":              "remote-db",
				"CORS_ALLOWED_ORIGINS": "http://test.com",
			},
			expectPanic: false,
			check: func(t *testing.T, cfg *Config) {
				assert.Equal(t, "9090", cfg.BackendPort)
				assert.Equal(t, "localhost", cfg.BackendHost)
				assert.Equal(t, "remote-db", cfg.DBHost)
				assert.Contains(t, cfg.CORSAllowedOrigins, "http://test.com")
			},
		},
		{
			name:        "use default values",
			envVars:     map[string]string{}, // Пустое окружение
			expectPanic: false,
			check: func(t *testing.T, cfg *Config) {
				assert.Equal(t, "8080", cfg.BackendPort)               // Default
				assert.Equal(t, "0.0.0.0", cfg.BackendHost)            // Default
				assert.Equal(t, "postgres", cfg.DBHost)                // Default
				assert.Equal(t, []string{"*"}, cfg.CORSAllowedOrigins) // Default
			},
		},
		{
			name: "panic on missing DB_USER",
			envVars: map[string]string{
				"DB_USER": "",
			},
			expectPanic: true,
		},
		{
			name: "panic on invalid port format",
			envVars: map[string]string{
				"BACKEND_PORT": "not-a-number",
			},
			expectPanic: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			os.Clearenv()

			for k, v := range minimalEnv {
				t.Setenv(k, v)
			}

			for k, v := range tt.envVars {
				t.Setenv(k, v)
			}

			if tt.expectPanic {
				assert.Panics(t, func() {
					Load()
				})
				return
			}

			cfg := Load()
			if tt.check != nil {
				tt.check(t, cfg)
			}

			assert.Contains(t, cfg.DBUrl, "postgres://")
			assert.Contains(t, cfg.DBUrl, "sslmode=disable")
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
			name: "valid minimal config",
			config: Config{
				BackendPort: "8080",
				DBPort:      "5432",
				DBUser:      "user",
				DBPassword:  "pass",
				DBName:      "db",
				JWTSecret:   "secret",
			},
			wantError: false,
		},
		{
			name: "invalid BackendPort format",
			config: Config{
				BackendPort: "abc",
				DBUser:      "user",
				DBPassword:  "pass",
				DBName:      "db",
				JWTSecret:   "secret",
			},
			wantError: true,
		},
		{
			name: "missing critical field JWTSecret",
			config: Config{
				BackendPort: "8080",
				DBUser:      "user",
				DBPassword:  "pass",
				DBName:      "db",
			},
			wantError: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			errs := tt.config.Validate()
			if tt.wantError {
				assert.NotEmpty(t, errs, "Expected errors but got none")
			} else {
				assert.Empty(t, errs, "Expected no errors but got: %v", errs)
			}
		})
	}
}
