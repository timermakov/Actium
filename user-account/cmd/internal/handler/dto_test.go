package handler

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRegisterRequest_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		request RegisterRequest
		wantErr bool
	}{
		{
			name: "Success",
			request: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				Nickname: "cool_user",
			},
			wantErr: false,
		},
		{
			name: "Empty Email",
			request: RegisterRequest{
				Email:    "  ",
				Password: "password123",
				Nickname: "user",
			},
			wantErr: true,
		},
		{
			name: "Invalid Email Format",
			request: RegisterRequest{
				Email:    "not-an-email",
				Password: "password123",
				Nickname: "user",
			},
			wantErr: true,
		},
		{
			name: "Nickname Too Short",
			request: RegisterRequest{
				Email:    "test@test.com",
				Password: "password123",
				Nickname: "ab",
			},
			wantErr: true,
		},
		{
			name: "Password Too Short",
			request: RegisterRequest{
				Email:    "test@test.com",
				Password: "12345",
				Nickname: "user",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.request.Validate()
			assert.Equal(t, tt.wantErr, err != nil)
		})
	}
}

func TestLoginRequest_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		request LoginRequest
		wantErr bool
	}{
		{
			name: "Success",
			request: LoginRequest{
				Email:    "test@example.com",
				Password: "any-password",
			},
			wantErr: false,
		},
		{
			name: "Email Required",
			request: LoginRequest{
				Email:    "",
				Password: "pass",
			},
			wantErr: true,
		},
		{
			name: "Password Required",
			request: LoginRequest{
				Email:    "test@test.com",
				Password: "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.request.Validate()
			assert.Equal(t, tt.wantErr, err != nil)
		})
	}
}

func TestUpdatePasswordRequest_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		request UpdatePasswordRequest
		wantErr bool
	}{
		{
			name:    "Success",
			request: UpdatePasswordRequest{NewPassword: "new-secure-pass"},
			wantErr: false,
		},
		{
			name:    "Password Too Short",
			request: UpdatePasswordRequest{NewPassword: "123"},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.request.Validate()
			assert.Equal(t, tt.wantErr, err != nil)
		})
	}
}
