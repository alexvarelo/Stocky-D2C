import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag, Sparkles } from 'lucide-react';
import { PostComments } from './PostComments';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { useLikePost, useUnlikePost } from '@/hooks/usePostActions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PortfolioPostCard } from './PortfolioPostCard';
import { InstrumentPostCard } from './InstrumentPostCard';
import { Post } from "@/types/social";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportContentDialog } from './ReportContentDialog';

type User = {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
};

export interface PostCardProps {
  post: Post & {
    id: string;
    user_id: string;
    user: {
      id?: string;
      name?: string;
      avatar_url?: string;
    };
    has_liked?: boolean;
    likes_count?: number;
    comments_count?: number;
    portfolio_id?: string;
    ticker?: string;
  };
  onCommentClick?: () => void;
  onUpdatePost?: (_updatedPost: PostCardProps['post']) => void;
  className?: string;
}

export const PostCard = ({
  post,
  onCommentClick: propOnCommentClick,
  onUpdatePost,
  className
}: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.has_liked);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [comments] = useState<Array<{
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      name?: string;
      avatar_url?: string;
    };
  }>>([]);
  
  // Use the new post action hooks
  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(!showComments);
    // TODO: Fetch comments when first opened
    if (!showComments && comments.length === 0) {
      // fetchComments()
    }
    propOnCommentClick?.();
  };

  const handleCommentAdded = () => {
    // Refresh comments after adding a new one
    // fetchComments()
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like posts',
        variant: 'destructive',
      });
      return;
    }

    const wasLiked = isLiked;
    const newLikeCount = wasLiked ? likeCount - 1 : likeCount + 1;

    // Optimistic update
    setIsLiked(!wasLiked);
    setLikeCount(newLikeCount);

    // Call the appropriate mutation
    if (wasLiked) {
      unlikePost(
        { post_id: post.id },
        {
          onError: () => {
            // Revert on error
            setIsLiked(wasLiked);
            setLikeCount(likeCount);
          },
        }
      );
    } else {
      likePost(
        { post_id: post.id },
        {
          onError: () => {
            // Revert on error
            setIsLiked(wasLiked);
            setLikeCount(likeCount);
          },
        }
      );
    }

    // Notify parent component if needed
    if (onUpdatePost) {
      onUpdatePost({
        ...post,
        has_liked: !wasLiked,
        likes_count: newLikeCount,
      });
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add share functionality here
  };

  const postData = {
    ...post,
    user: {
      ...post.user,
      id: post.user_id,
    } as User,
    comments_count: post.comments_count || 0,
    likes_count: likeCount,
    has_liked: isLiked,
  };

  return (
    <div className={cn(
      "w-full max-w-6xl mx-auto rounded-xl overflow-hidden transition-all duration-200",
      "bg-card text-card-foreground shadow-sm border border-border",
      "hover:shadow-md hover:border-border/80",
      className
    )}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (post.user?.id) {
                  navigate(`/user/${post.user.id}`);
                }
              }}
              className="flex items-start gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user?.avatar_url} alt={post.user?.name || 'User'} />
                <AvatarFallback>{(post.user?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="min-w-0">
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-foreground line-clamp-1 hover:underline">
                    {post.user?.name || 'Anonymous'}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    <time dateTime={post.created_at}>
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </time>
                  </span>
                </div>
              </div>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {post.is_ai_generated && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                title="Written by AI. Not investment advice."
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                AI-generated
              </span>
            )}
            {user?.id !== post.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="More options">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setReportOpen(true)}>
                    <Flag className="mr-2 h-4 w-4" aria-hidden="true" />
                    Report post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <ReportContentDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          targetType="post"
          targetId={post.id}
        />

        {/* Content */}
        <div className="mt-3 text-foreground">
          <p className="whitespace-pre-line">{post.content}</p>
        </div>

        {/* Portfolio or Instrument Card */}
        <div className="mt-6 space-y-4">
          {post.portfolio_id && <PortfolioPostCard portfolioId={post.portfolio_id} />}
          {post.ticker && <InstrumentPostCard ticker={post.ticker} />}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 group px-2"
              onClick={handleCommentClick}
              aria-label={`Comments (${postData.comments_count})`}
              aria-expanded={showComments}
            >
              <MessageCircle className="h-4 w-4 group-hover:text-blue-500" />
              <span className="text-sm group-hover:text-blue-500">
                {postData.comments_count}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-1 group px-2 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
              aria-label={isLiked ? `Unlike (${likeCount} likes)` : `Like (${likeCount} likes)`}
              aria-pressed={!!isLiked}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''} group-hover:text-red-500`} />
              {(!isLiked && likeCount > 0) && (
                <span className="text-sm text-muted-foreground group-hover:text-red-500">
                  {likeCount}
                </span>
              )}
              {isLiked && (
                <span className="text-sm text-red-500 group-hover:text-red-500">
                  {likeCount}
                </span>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 group px-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 group-hover:text-green-500" />
              <span className="text-sm group-hover:text-green-500">
                Share
              </span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border pt-3 px-4 pb-2">
          <PostComments 
            postId={post.id} 
            comments={comments} 
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}
    </div>
  );
};
