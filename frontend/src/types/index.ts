export interface Application {
  id: string;
  company: string;
  role: string;
  date: string;
  updatedAt: string;
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected' | 'Archived';
  notes: Note[];
  history: HistoryEvent[];
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface HistoryEvent {
  date: string;
  event: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  likes: number;
  coverImage: string;
  isPublic: boolean;
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ThemeState {
  isDark: boolean;
}

export interface AppState {
  auth: AuthState;
  theme: ThemeState;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'CLEAR_ERROR' };

export type ThemeAction =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; payload: boolean };

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateApplicationData {
  company: string;
  role: string;
  status: Application['status'];
}

export interface CreateNoteData {
  content: string;
}

export interface CreateBlogPostData {
  title: string;
  content: string;
  isPublic: boolean;
  coverImage?: string;
}

export interface DashboardStats {
  totalApplications: number;
  interviewing: number;
  offers: number;
  recentApplications: Application[];
  recentBlogPosts: BlogPost[];
  statusBreakdown: {
    [key in Application['status']]: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: number;
}