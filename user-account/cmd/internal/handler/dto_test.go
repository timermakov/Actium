package handler

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRegisterRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		request RegisterRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid request",
			request: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				Nickname: "testuser",
			},
			wantErr: false,
		},
		{
			name: "valid request with email whitespace",
			request: RegisterRequest{
				Email:    "  test@example.com  ",
				Password: "password123",
				Nickname: "  testuser  ",
			},
			wantErr: false, // Trims whitespace
		},
		{
			name: "empty email",
			request: RegisterRequest{
				Email:    "",
				Password: "password123",
				Nickname: "testuser",
			},
			wantErr: true,
			errMsg:  "email is required",
		},
		{
			name: "whitespace-only email",
			request: RegisterRequest{
				Email:    "   ",
				Password: "password123",
				Nickname: "testuser",
			},
			wantErr: true,
			errMsg:  "email is required",
		},
		{
			name: "invalid email format",
			request: RegisterRequest{
				Email:    "not-an-email",
				Password: "password123",
				Nickname: "testuser",
			},
			wantErr: true,
			errMsg:  "invalid email format",
		},
		{
			name: "email without domain",
			request: RegisterRequest{
				Email:    "test@",
				Password: "password123",
				Nickname: "testuser",
			},
			wantErr: true,
			errMsg:  "invalid email format",
		},
		{
			name: "nickname too short",
			request: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				Nickname: "ab",
			},
			wantErr: true,
			errMsg:  "nickname must be between 3 and 30 characters",
		},
		{
			name: "nickname too long",
			request: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				Nickname: strings.Repeat("a", 31),
			},
			wantErr: true,
			errMsg:  "nickname must be between 3 and 30 characters",
		},
		{
			name: "password too short",
			request: RegisterRequest{
				Email:    "test@example.com",
				Password: "12345",
				Nickname: "testuser",
			},
			wantErr: true,
			errMsg:  "password must be at least 6 characters long",
		},
		{
			name: "password exactly 6 characters",
			request: RegisterRequest{
				Email:    "test@example.com",
				Password: "123456",
				Nickname: "testuser",
			},
			wantErr: false,
		},
		{
			name: "nickname exactly 3 characters",
			request: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				Nickname: "abc",
			},
			wantErr: false,
		},
		{
			name: "nickname exactly 30 characters",
			request: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				Nickname: strings.Repeat("a", 30),
			},
			wantErr: false,
		},
		{
			name: "all fields invalid",
			request: RegisterRequest{
				Email:    "invalid-email",
				Password: "123",
				Nickname: "ab",
			},
			wantErr: true,
			errMsg:  "invalid email format", // First error encountered
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.request.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestLoginRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		request LoginRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid request",
			request: LoginRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			wantErr: false,
		},
		{
			name: "valid with trimmed email",
			request: LoginRequest{
				Email:    "  test@example.com  ",
				Password: "password123",
			},
			wantErr: false, // Trims whitespace
		},
		{
			name: "empty email",
			request: LoginRequest{
				Email:    "",
				Password: "password123",
			},
			wantErr: true,
			errMsg:  "email is required",
		},
		{
			name: "whitespace-only email",
			request: LoginRequest{
				Email:    "   ",
				Password: "password123",
			},
			wantErr: true,
			errMsg:  "email is required",
		},
		{
			name: "empty password",
			request: LoginRequest{
				Email:    "test@example.com",
				Password: "",
			},
			wantErr: true,
			errMsg:  "password is required",
		},
		{
			name: "both empty",
			request: LoginRequest{
				Email:    "",
				Password: "",
			},
			wantErr: true,
			errMsg:  "email is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.request.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestUpdatePasswordRequest_Validate(t *testing.T) {
	tests := []struct {
		name    string
		request UpdatePasswordRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid request",
			request: UpdatePasswordRequest{
				NewPassword: "newpassword123",
			},
			wantErr: false,
		},
		{
			name: "valid after trim",
			request: UpdatePasswordRequest{
				NewPassword: "  newpassword123  ",
			},
			wantErr: false, // Trims whitespace
		},
		{
			name: "too short password",
			request: UpdatePasswordRequest{
				NewPassword: "12345",
			},
			wantErr: true,
			errMsg:  "new password must be at least 6 characters long",
		},
		{
			name: "exactly 6 characters",
			request: UpdatePasswordRequest{
				NewPassword: "123456",
			},
			wantErr: false,
		},
		{
			name: "empty password after trim",
			request: UpdatePasswordRequest{
				NewPassword: "     ",
			},
			wantErr: true,
			errMsg:  "new password must be at least 6 characters long",
		},
		{
			name: "long password",
			request: UpdatePasswordRequest{
				NewPassword: strings.Repeat("a", 100),
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.request.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.Contains(t, err.Error(), tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
