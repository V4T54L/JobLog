package usecase

import (
	"errors"
	"fmt" // Added from attempted

	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
	"job-app-tracker/pkg/util"
)

type userService struct {
	userRepo   repository.UserRepository
	blogRepo   repository.BlogPostRepository   // Added from attempted
	followRepo repository.FollowRepository // Added from attempted
}

func NewUserService(userRepo repository.UserRepository, blogRepo repository.BlogPostRepository, followRepo repository.FollowRepository) UserUseCase { // Updated signature
	return &userService{
		userRepo:   userRepo,
		blogRepo:   blogRepo,
		followRepo: followRepo,
	}
}

func (s *userService) Register(username, email, password string) (*domain.User, error) {
	// Basic validation
	if username == "" || email == "" || password == "" {
		return nil, errors.New("username, email, and password are required")
	}

	// Check if user already exists
	existingUser, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, fmt.Errorf("error checking for existing user by email: %w", err) // Added error wrapping
	}
	if existingUser != nil {
		return nil, errors.New("user with this email already exists")
	}

	existingUser, err = s.userRepo.GetByUsername(username)
	if err != nil {
		return nil, fmt.Errorf("error checking for existing user by username: %w", err) // Added error wrapping
	}
	if existingUser != nil {
		return nil, errors.New("username is already taken")
	}

	// Hash password
	hashedPassword, err := util.HashPassword(password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err) // Added error wrapping
	}

	// Create user
	user := &domain.User{
		Username:       username,
		Email:          email,
		HashedPassword: hashedPassword,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err) // Added error wrapping
	}

	return user, nil
}

func (s *userService) Login(email, password string) (*domain.User, string, error) { // Updated signature
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, "", fmt.Errorf("error retrieving user: %w", err) // Added error wrapping
	}
	if user == nil {
		return nil, "", errors.New("invalid credentials")
	}

	if !util.CheckPasswordHash(password, user.HashedPassword) {
		return nil, "", errors.New("invalid credentials")
	}

	token, err := util.GenerateJWT(user.ID, user.Username)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err) // Added error wrapping
	}

	return user, token, nil // Updated return value
}

func (s *userService) GetProfile(username string, viewerID int64) (*UserProfile, error) { // Added from attempted
	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		return nil, fmt.Errorf("error getting user: %w", err)
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	posts, err := s.blogRepo.GetPublicPostsByUserID(user.ID)
	if err != nil {
		return nil, fmt.Errorf("error getting user posts: %w", err)
	}

	followerCount, err := s.followRepo.GetFollowerCount(user.ID)
	if err != nil {
		return nil, fmt.Errorf("error getting follower count: %w", err)
	}

	followingCount, err := s.followRepo.GetFollowingCount(user.ID)
	if err != nil {
		return nil, fmt.Errorf("error getting following count: %w", err)
	}

	isFollowing := false
	if viewerID != 0 && viewerID != user.ID {
		isFollowing, err = s.followRepo.Exists(viewerID, user.ID)
		if err != nil {
			return nil, fmt.Errorf("error checking follow status: %w", err)
		}
	}

	user.HashedPassword = "" // Sanitize user data
	profile := &UserProfile{
		User:           user,
		Posts:          posts,
		IsFollowing:    isFollowing,
		FollowerCount:  followerCount,
		FollowingCount: followingCount,
	}

	return profile, nil
}

func (s *userService) FollowUser(followerID int64, followeeUsername string) error { // Added from attempted
	followee, err := s.userRepo.GetByUsername(followeeUsername)
	if err != nil || followee == nil {
		return errors.New("user to follow not found")
	}

	if followerID == followee.ID {
		return errors.New("cannot follow yourself")
	}

	exists, err := s.followRepo.Exists(followerID, followee.ID)
	if err != nil {
		return err
	}
	if exists {
		return nil // Already following, no error
	}

	follow := &domain.Follow{
		FollowerUserID: followerID,
		FolloweeUserID: followee.ID,
	}

	return s.followRepo.Create(follow)
}

func (s *userService) UnfollowUser(followerID int64, followeeUsername string) error { // Added from attempted
	followee, err := s.userRepo.GetByUsername(followeeUsername)
	if err != nil || followee == nil {
		return errors.New("user to unfollow not found")
	}

	return s.followRepo.Delete(followerID, followee.ID)
}

