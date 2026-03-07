package repository

import (
	"context"
	"database/sql"
	"errors"
	"user-account/cmd/internal/gen/docflow/public/table"

	jet_model "user-account/cmd/internal/gen/docflow/public/model"
	"user-account/cmd/internal/model"

	. "github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
)

type UserRepository interface {
	Create(ctx context.Context, user *model.User) error
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.User, error)
	Delete(ctx context.Context, id uuid.UUID) error
	UpdatePassword(ctx context.Context, id uuid.UUID, hash string) error
	List(ctx context.Context) ([]model.User, error)
}

type userRepository struct {
	db *pgxpool.Pool
}

func NewPostgresUserRepository(db *pgxpool.Pool) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *model.User) error {
	jetUser := jet_model.Users{
		ID:           user.ID,
		Email:        user.Email,
		Nickname:     user.Nickname,
		PasswordHash: user.PasswordHash,
		Role:         user.Role,
	}

	stmt := table.Users.INSERT(table.Users.ID, table.Users.Email, table.Users.Nickname, table.Users.PasswordHash, table.Users.Role).
		MODEL(jetUser)

	db := stdlib.OpenDBFromPool(r.db)
	_, err := stmt.ExecContext(ctx, db)
	return err
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var dest jet_model.Users

	stmt := SELECT(table.Users.AllColumns).
		FROM(table.Users).
		WHERE(table.Users.Email.EQ(String(email)))

	db := stdlib.OpenDBFromPool(r.db)
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	res := model.ToDomain(dest)
	return &res, nil
}
func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	var dest jet_model.Users

	stmt := SELECT(table.Users.AllColumns).
		FROM(table.Users).
		WHERE(table.Users.ID.EQ(UUID(id)))

	db := stdlib.OpenDBFromPool(r.db)
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	res := model.ToDomain(dest)
	return &res, nil
}

func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	stmt := table.Users.DELETE().WHERE(table.Users.ID.EQ(UUID(id)))

	db := stdlib.OpenDBFromPool(r.db)
	result, err := stmt.ExecContext(ctx, db)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("user not found")
	}
	return nil
}

func (r *userRepository) UpdatePassword(ctx context.Context, id uuid.UUID, hash string) error {
	stmt := table.Users.UPDATE(table.Users.PasswordHash).
		SET(String(hash)).
		WHERE(table.Users.ID.EQ(UUID(id)))

	db := stdlib.OpenDBFromPool(r.db)
	result, err := stmt.ExecContext(ctx, db)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("user not found")
	}
	return nil
}
func (r *userRepository) List(ctx context.Context) ([]model.User, error) {
	var dest []jet_model.Users

	stmt := SELECT(table.Users.ID, table.Users.Email, table.Users.Nickname, table.Users.Role, table.Users.CreatedAt).
		FROM(table.Users)

	db := stdlib.OpenDBFromPool(r.db)
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, err
	}

	users := make([]model.User, len(dest))
	for i, u := range dest {
		users[i] = model.ToDomain(u)
	}

	return users, nil
}
