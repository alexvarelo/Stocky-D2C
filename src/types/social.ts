export type PostType = 'UPDATE' | 'TRADE' | 'ANALYSIS' | 'GENERAL';

export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  is_following?: boolean;
}

export interface PortfolioData {
  id: string;
  name: string;
  is_public: boolean;
  total_value?: number;
  daily_change?: number;
  holdings_count?: number;
}

export interface Post {
  id: string;
  user_id: string;
  portfolio_id?: string;
  ticker?: string;
  content: string;
  post_type: PostType;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user: User;
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
  portfolio?: PortfolioData;
  is_ai_generated?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  user: User;
  replies?: Comment[];
}

export interface CreatePostDto {
  user_id: string;
  content: string;
  ticker?: string;
  post_type?: PostType;
  is_public?: boolean;
  portfolio_id?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
