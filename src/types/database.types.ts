export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}
