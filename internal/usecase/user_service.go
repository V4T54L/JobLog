package usecase

import (
	"errors"
	"fmt"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
	"job-app-tracker/pkg/util"
	"regexp"
)

var (
	emailRegex = regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
)

type userService struct {
	userRepo   repository.UserRepository
	blogRepo   repository.BlogPostRepository
	followRepo repository.FollowRepository
}

func NewUserService(userRepo repository.UserRepository, blogRepo repository.BlogPostRepository, followRepo repository.FollowRepository) UserUseCase {
	return &userService{
		userRepo:   userRepo,
		blogRepo:   blogRepo,
		followRepo: followRepo,
	}
}

func (s *userService) Register(username, email, password string) (*domain.User, error) {
	if len(username) < 3 || len(username) > 50 {
		return nil, errors.New("username must be between 3 and 50 characters")
	}
	if !emailRegex.MatchString(email) {
		return nil, errors.New("invalid email format")
	}
	if len(password) < 8 {
		return nil, errors.New("password must be at least 8 characters long")
	}

	existingUser, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, fmt.Errorf("error checking for existing user by email: %w", err)
	}
	if existingUser != nil {
		return nil, errors.New("email already in use")
	}

	existingUser, err = s.userRepo.GetByUsername(username)
	if err != nil {
		return nil, fmt.Errorf("error checking for existing user by username: %w", err)
	}
	if existingUser != nil {
		return nil, errors.New("username already taken")
	}

	hashedPassword, err := util.HashPassword(password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &domain.User{
		Username:       username,
		Email:          email,
		HashedPassword: hashedPassword,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

func (s *userService) Login(email, password string) (*domain.User, string, error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, "", fmt.Errorf("error retrieving user: %w", err)
	}
	if user == nil {
		return nil, "", errors.New("invalid credentials")
	}

	if !util.CheckPasswordHash(password, user.HashedPassword) {
		return nil, "", errors.New("invalid credentials")
	}

	token, err := util.GenerateJWT(user.ID, user.Username)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return user, token, nil
}

func (s *userService) GetProfile(username string, viewerID int64) (*UserProfile, error) {
	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		return nil, fmt.Errorf("error getting user: %w", err)
	}
	if user == nil {
		return nil, nil // Not found
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

	// Sanitize user data before returning
	user.HashedPassword = ""
	user.Email = "" // Attempted content removes email, which is a good security practice for public profiles.

	profile := &UserProfile{
		User:           user,  // Attempted content uses *user, assuming UserProfile.User is domain.User
		Posts:          posts, // Attempted content uses BlogPosts, original uses Posts
		IsFollowing:    isFollowing,
		FollowerCount:  followerCount,
		FollowingCount: followingCount,
	}

	return profile, nil
}

func (s *userService) FollowUser(followerID int64, followeeUsername string) error {
	followee, err := s.userRepo.GetByUsername(followeeUsername)
	if err != nil {
		return err
	}
	if followee == nil {
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
		return errors.New("already following this user") // Attempted content provides a more explicit error
	}

	follow := &domain.Follow{
		FollowerUserID: followerID,
		FolloweeUserID: followee.ID,
	}
	return s.followRepo.Create(follow)
}

func (s *userService) UnfollowUser(followerID int64, followeeUsername string) error {
	followee, err := s.userRepo.GetByUsername(followeeUsername)
	if err != nil {
		return err
	}
	if followee == nil {
		return errors.New("user to unfollow not found")
	}

	return s.followRepo.Delete(followerID, followee.ID)
}
