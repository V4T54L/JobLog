package service

import (
	"context"
	"errors"
	"fmt"
	"log"

	"joblog/internal/core/domain"
	"joblog/pkg/auth"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo   domain.UserRepository
	jwtManager *auth.JWTManager
}

func NewAuthService(userRepo domain.UserRepository, jwtManager *auth.JWTManager) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		jwtManager: jwtManager,
	}
}

func (s *AuthService) Register(ctx context.Context, reg domain.UserRegistration) (*domain.User, error) {
	// Basic validation
	if reg.Username == "" || reg.Email == "" || reg.Password == "" {
		return nil, errors.New("username, email, and password are required")
	}

	// Check if user already exists
	if _, err := s.userRepo.GetByEmail(ctx, reg.Email); err == nil {
		log.Println("[Register] Error: ", err)
		return nil, fmt.Errorf("user with email %s already exists", reg.Email)
	}
	if _, err := s.userRepo.GetByUsername(ctx, reg.Username); err == nil {
		log.Println("[Register] Error: ", err)
		return nil, fmt.Errorf("user with username %s already exists", reg.Username)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(reg.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("could not hash password: %w", err)
	}

	// Create new user
	user := &domain.User{
		ID:           uuid.NewString(),
		Username:     reg.Username,
		Email:        reg.Email,
		PasswordHash: string(hashedPassword),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("could not create user: %w", err)
	}

	return user, nil
}

func (s *AuthService) Login(ctx context.Context, login domain.UserLogin) (*domain.AuthResponse, error) {
	user, err := s.userRepo.GetByUsername(ctx, login.Username)
	if err != nil {
		log.Println("[Login] Error: ", err)
		return nil, errors.New("invalid username or password")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(login.Password))
	if err != nil {
		log.Println("[Login] Error: ", err)
		return nil, errors.New("invalid username or password")
	}

	token, err := s.jwtManager.Generate(user)
	if err != nil {
		return nil, fmt.Errorf("could not generate token: %w", err)
	}

	return &domain.AuthResponse{
		Token: token,
		User:  user,
	}, nil
}

func (s *AuthService) GetUserProfile(ctx context.Context, userID string) (*domain.User, error) {
	return s.userRepo.GetByID(ctx, userID)
}
