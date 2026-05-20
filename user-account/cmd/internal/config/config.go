package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config - модель конфига
type Config struct {
	BackendHost        string
	BackendPort        string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBUrl              string
	JWTSecret          string
	CORSAllowedOrigins []string
}

// Load - прочитать из окружения
func Load() *Config {
	cfg := &Config{
		// Теперь ищем BACKEND_HOST и BACKEND_PORT, как в твоем .env.local
		BackendHost:        getEnvWithDefault("BACKEND_HOST", "0.0.0.0"),
		BackendPort:        getEnvWithDefault("BACKEND_PORT", "8080"),
		DBHost:             getEnvWithDefault("DB_HOST", "postgres"),
		DBPort:             getEnvWithDefault("DB_PORT", "5432"),
		DBUser:             getEnv("DB_USER"),
		DBPassword:         getEnv("DB_PASSWORD"),
		DBName:             getEnv("DB_NAME"),
		JWTSecret:          getEnv("JWT_SECRET"),
		CORSAllowedOrigins: parseCommaSeparatedList(getEnvWithDefault("CORS_ALLOWED_ORIGINS", "*")),
	}

	if errs := cfg.Validate(); len(errs) > 0 {
		panic(formatErrors(errs))
	}

	cfg.DBUrl = fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	return cfg
}

func (c *Config) Validate() []error {
	var errs []error

	if c.DBUser == "" {
		errs = append(errs, fmt.Errorf("DB_USER is required"))
	}
	if c.DBPassword == "" {
		errs = append(errs, fmt.Errorf("DB_PASSWORD is required"))
	}
	if c.DBName == "" {
		errs = append(errs, fmt.Errorf("DB_NAME is required"))
	}
	if c.JWTSecret == "" {
		errs = append(errs, fmt.Errorf("JWT_SECRET is required"))
	}

	// Валидация форматов чисел
	if _, err := strconv.Atoi(c.BackendPort); err != nil {
		errs = append(errs, fmt.Errorf("BACKEND_PORT must be a number (got: %s)", c.BackendPort))
	}
	if _, err := strconv.Atoi(c.DBPort); err != nil {
		errs = append(errs, fmt.Errorf("DB_PORT must be a number (got: %s)", c.DBPort))
	}

	return errs
}

func getEnv(key string) string {
	return strings.TrimSpace(os.Getenv(key))
}

func getEnvWithDefault(key, fallback string) string {
	if value := getEnv(key); value != "" {
		return value
	}
	return fallback
}

func parseCommaSeparatedList(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	var out []string
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}

func formatErrors(errs []error) string {
	var builder strings.Builder
	builder.WriteString("config validation failed:\n")
	for _, err := range errs {
		builder.WriteString(" - ")
		builder.WriteString(err.Error())
		builder.WriteString("\n")
	}
	return builder.String()
}
