import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Post, PostType } from '@/types/social';

interface UseInfinitePostsOptions {
  pageSize?: number;
  isPublic?: boolean;
  onlyFollowing?: boolean;
  portfolioId?: string;
  postType?: PostType;
  userId?: string;
  authorId?: string;
  tickerId?: string;
  excludeUserId?: string; // User ID to exclude from results
}

interface PageData {
  data: Post[];
  count: number | undefined;
  page: number;
}

const fetchPosts = async ({
  pageParam = 1,
  pageSize = 10,
  ...restOptions
}: {
  pageParam: number;
  pageSize: number;
  isPublic?: boolean;
  onlyFollowing?: boolean;
  portfolioId?: string;
  postType?: PostType;
  userId?: string;
  tickerId?: string;
  authorId?: string;
  excludeUserId?: string;
}): Promise<PageData> => {
  const offset = (pageParam - 1) * pageSize;
  
  const { data, error, count } = await supabase.rpc('get_posts_with_details', {
    p_is_public: restOptions.isPublic ?? true,
    p_limit: pageSize,
    p_offset: offset,
    p_only_following: restOptions.onlyFollowing ?? false,
    p_portfolio_id: restOptions.portfolioId || undefined,
    p_post_type: restOptions.postType || undefined,
    p_user_id: restOptions.userId || undefined,
    p_author_id: restOptions.authorId || undefined,
    p_ticker: restOptions.tickerId || undefined,
    p_exclude_user: restOptions.excludeUserId || undefined,
  });

  if (error) {
    throw error;
  }

  // Transform the raw RPC response to match our Post type
  const postsData: Post[] = (Array.isArray(data) ? data : []).map(rawPost => ({
    id: rawPost.id,
    user_id: rawPost.user_id,
    portfolio_id: rawPost.portfolio_id || undefined,
    content: rawPost.content,
    post_type: rawPost.post_type as PostType,
    is_public: rawPost.is_public,
    created_at: rawPost.created_at,
    updated_at: rawPost.updated_at,
    user: {
      id: rawPost.user_id,
      name: rawPost.username,
      avatar_url: rawPost.avatar_url || undefined,
    },
    likes_count: rawPost.like_count,
    // The RPC returns comment_count; reading comments_count left every count undefined.
    comments_count: rawPost.comment_count,
    has_liked: rawPost.is_liked_by_me,
    ticker: rawPost.ticker,
    is_ai_generated: rawPost.is_ai_generated ?? false,
  }));

  return {
    data: postsData,
    count: count || 0,
    page: pageParam,
  };
};

export const useInfinitePosts = (options: UseInfinitePostsOptions = { pageSize: 10 }) => {
  const { pageSize = 10, ...restOptions } = options;
  const queryKey = ['posts', 'infinite', restOptions];

  return useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPosts({ 
      pageParam, 
      pageSize, 
      ...restOptions 
    }),
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than the page size, we've reached the end
      if (lastPage.data.length < (options.pageSize || 10)) {
        return undefined;
      }
      // Otherwise, return the next page number
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
