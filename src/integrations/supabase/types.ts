export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      api_credentials: {
        Row: {
          client_id: string
          client_secret: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          provider_name: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          client_secret: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          provider_name: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          client_secret?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          provider_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      article_engagement: {
        Row: {
          article_id: string
          created_at: string | null
          engagement_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          engagement_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          engagement_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_engagement_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_engagement_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      article_sections: {
        Row: {
          article_id: string
          content: Json
          created_at: string | null
          id: string
          section_order: number
          section_title: string
        }
        Insert: {
          article_id: string
          content: Json
          created_at?: string | null
          id?: string
          section_order: number
          section_title: string
        }
        Update: {
          article_id?: string
          content?: Json
          created_at?: string | null
          id?: string
          section_order?: number
          section_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_sections_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_sources: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          relevance_score: number | null
          source_date: string | null
          source_title: string | null
          source_type: string
          source_url: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          relevance_score?: number | null
          source_date?: string | null
          source_title?: string | null
          source_type: string
          source_url?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          relevance_score?: number | null
          source_date?: string | null
          source_title?: string | null
          source_type?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_sources_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          article_type: string
          author: string | null
          content: Json
          created_at: string | null
          id: string
          is_premium: boolean | null
          metadata: Json | null
          slug: string
          status: string | null
          summary: string | null
          tags: string[] | null
          tickers: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          article_type: string
          author?: string | null
          content: Json
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          metadata?: Json | null
          slug: string
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          tickers?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          article_type?: string
          author?: string | null
          content?: Json
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          metadata?: Json | null
          slug?: string
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          tickers?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          id: string
          role: string
          tool_call_id: string | null
          tool_calls: Json | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      holdings: {
        Row: {
          average_price: number
          created_at: string | null
          id: string
          notes: string | null
          portfolio_id: string
          quantity: number
          ticker: string
          total_invested: number | null
          updated_at: string | null
        }
        Insert: {
          average_price: number
          created_at?: string | null
          id?: string
          notes?: string | null
          portfolio_id: string
          quantity: number
          ticker: string
          total_invested?: number | null
          updated_at?: string | null
        }
        Update: {
          average_price?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          portfolio_id?: string
          quantity?: number
          ticker?: string
          total_invested?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_follows: {
        Row: {
          created_at: string | null
          id: string
          portfolio_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          portfolio_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          portfolio_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_follows_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_value_history: {
        Row: {
          created_at: string | null
          id: string
          portfolio_id: string
          snapshot_date: string
          total_cost: number | null
          total_return_percentage: number | null
          total_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          portfolio_id: string
          snapshot_date: string
          total_cost?: number | null
          total_return_percentage?: number | null
          total_value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          portfolio_id?: string
          snapshot_date?: string
          total_cost?: number | null
          total_return_percentage?: number | null
          total_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_value_history_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_values: {
        Row: {
          portfolio_id: string
          total_return_percentage: number | null
          total_value: number
          updated_at: string | null
        }
        Insert: {
          portfolio_id: string
          total_return_percentage?: number | null
          total_value: number
          updated_at?: string | null
        }
        Update: {
          portfolio_id?: string
          total_return_percentage?: number | null
          total_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_values_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_public: boolean | null
          portfolio_id: string | null
          post_type: string | null
          ticker: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          portfolio_id?: string | null
          post_type?: string | null
          ticker?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          portfolio_id?: string | null
          post_type?: string | null
          ticker?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticker_prices: {
        Row: {
          last_updated: string | null
          price: number
          ticker: string
        }
        Insert: {
          last_updated?: string | null
          price: number
          ticker: string
        }
        Update: {
          last_updated?: string | null
          price?: number
          ticker?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string | null
          fees: number | null
          holding_id: string | null
          id: string
          notes: string | null
          portfolio_id: string
          price_per_share: number
          quantity: number
          ticker: string
          total_amount: number | null
          transaction_date: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fees?: number | null
          holding_id?: string | null
          id?: string
          notes?: string | null
          portfolio_id: string
          price_per_share: number
          quantity: number
          ticker: string
          total_amount?: number | null
          transaction_date: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fees?: number | null
          holding_id?: string | null
          id?: string
          notes?: string | null
          portfolio_id?: string
          price_per_share?: number
          quantity?: number
          ticker?: string
          total_amount?: number | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_holding_id_fkey"
            columns: ["holding_id"]
            isOneToOne: false
            referencedRelation: "holdings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          default_currency: string | null
          email_notifications: boolean | null
          portfolio_visibility: string | null
          push_notifications: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_currency?: string | null
          email_notifications?: boolean | null
          portfolio_visibility?: string | null
          push_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_currency?: string | null
          email_notifications?: boolean | null
          portfolio_visibility?: string | null
          push_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          updated_at: string | null
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_public?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      watchlist_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          target_price: number | null
          ticker: string
          watchlist_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          target_price?: number | null
          ticker: string
          watchlist_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          target_price?: number | null
          ticker?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_post_comment: {
        Args: {
          p_content: string
          p_parent_comment_id?: string
          p_post_id: string
          p_user_id: string
        }
        Returns: Json
      }
      add_post_like: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: Json
      }
      add_transaction: {
        Args: {
          fees_param?: number
          notes_param?: string
          portfolio_uuid: string
          price_per_share_param: number
          quantity_param: number
          ticker_param: string
          transaction_date_param: string
          transaction_type_param: string
        }
        Returns: string
      }
      calculate_portfolio_value: {
        Args: { portfolio_uuid: string }
        Returns: number
      }
      create_post: {
        Args: {
          p_content: string
          p_is_public?: boolean
          p_portfolio_id?: string
          p_post_type?: string
          p_ticker?: string
          p_user_id: string
        }
        Returns: Json
      }
      follow_user: {
        Args: { p_follower_id: string; p_following_id: string }
        Returns: Json
      }
      get_portfolio_rankings: {
        Args: {
          p_author_id?: string
          p_end_date?: string
          p_limit?: number
          p_page?: number
          p_public_only?: boolean
          p_sort_by?: string
          p_sort_order?: string
          p_start_date?: string
        }
        Returns: {
          author_avatar_url: string
          author_full_name: string
          author_id: string
          author_username: string
          created_at: string
          description: string
          holdings_count: number
          name: string
          portfolio_id: string
          top_holding_allocation: number
          top_holding_ticker: string
          total_count: number
          total_return_percentage: number
          total_value: number
        }[]
      }
      get_portfolio_summary: {
        Args: { portfolio_uuid: string }
        Returns: {
          last_transaction_date: string
          total_holdings: number
          total_invested: number
          total_transactions: number
        }[]
      }
      get_posts_with_details: {
        Args: {
          p_author_id?: string
          p_exclude_user?: string
          p_is_public?: boolean
          p_limit?: number
          p_offset?: number
          p_only_following?: boolean
          p_portfolio_id?: string
          p_post_type?: string
          p_ticker?: string
          p_user_id?: string
        }
        Returns: {
          avatar_url: string
          comment_count: number
          content: string
          created_at: string
          full_name: string
          id: string
          is_liked_by_me: boolean
          is_public: boolean
          like_count: number
          portfolio_id: string
          portfolio_name: string
          post_type: string
          ticker: string
          updated_at: string
          user_id: string
          username: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
