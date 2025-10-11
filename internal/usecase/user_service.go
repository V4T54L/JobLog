package usecase

import (
	"errors"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
	"job-app-tracker/pkg/util"
)

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserUseCase {
	return &userService{userRepo: userRepo}
}

func (s *userService) Register(username, email, password string) (*domain.User, error) {
	// Basic validation
	if username == "" || email == "" || password == "" {
		return nil, errors.New("username, email, and password are required")
	}

	// Check if user already exists
	existingUser, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("user with this email already exists")
	}

	existingUser, err = s.userRepo.GetByUsername(username)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("username is already taken")
	}

	// Hash password
	hashedPassword, err := util.HashPassword(password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &domain.User{
		Username:       username,
		Email:          email,
		HashedPassword: hashedPassword,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *userService) Login(email, password string) (string, error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", errors.New("invalid credentials")
	}

	if !util.CheckPasswordHash(password, user.HashedPassword) {
		return "", errors.New("invalid credentials")
	}

	token, err := util.GenerateJWT(user.ID, user.Username)
	if err != nil {
		return "", err
	}

	return token, nil
}

