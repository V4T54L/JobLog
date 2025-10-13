
// A string literal union is often more flexible than a TypeScript enum
export type ApplicationStatus = "Applied" | "Interviewing" | "Offer" | "Rejected" | "Archived";

// |--- User & Auth Types ---

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// |--- Application Types ---

export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO 8601 date string
}

export interface HistoryEvent {
  date: string; // ISO 8601 date string
  event: string;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  date: string; // "YYYY-MM-DD"
  updatedAt: string; // "YYYY-MM-DD"
  status: ApplicationStatus;
  notes: Note[];
  history: HistoryEvent[];
}

export interface NewApplication {
  company: string;
  role: string;
  date: string; // "YYYY-MM-DD"
  status: ApplicationStatus;
}

// Use Partial<T> for update types to make all fields optional
export type ApplicationUpdate = Partial<NewApplication>;


// |--- Blog Types ---

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string; // ISO 8601 date string
  likes: number;
  replies: Comment[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  createdAt: string; // ISO 8601 date string
  likes: number;
  coverImage: string;
  isPublic: boolean;
  comments: Comment[];
}

export interface NewBlogPost {
  title: string;
  content: string;
  isPublic?: boolean;
}
