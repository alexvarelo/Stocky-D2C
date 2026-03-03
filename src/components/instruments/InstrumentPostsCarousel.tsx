import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { Post } from "@/types/social";
import { useInfinitePosts } from "@/hooks/useInfinitePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

interface InstrumentPostsCarouselProps {
  ticker: string;
}

const PostCard = ({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative h-full w-72 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/50",
        className
      )}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          {post.user.avatar_url ? (
            <img
              className="rounded-full w-8 h-8 object-cover"
              src={post.user.avatar_url}
              alt={post.user.name}
            />
          ) : (
            <div className="rounded-full w-8 h-8 bg-gray-200 dark:bg-gray-700" />
          )}
          <div>
            <p className="text-sm font-medium">{post.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <p className="text-sm line-clamp-2">{post.content}</p>
        {post.ticker && (
          <div className="mt-2">
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-flex items-center gap-1">
              <CompanyLogo ticker={post.ticker} size={14} className="border-primary/20" />
              {post.ticker}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export function InstrumentPostsCarousel({ ticker }: InstrumentPostsCarouselProps) {
  const { data, isLoading } = useInfinitePosts({
    tickerId: ticker,
    pageSize: 10,
  });

  const posts = data?.pages.flatMap((page) => page.data) || [];

  if (isLoading) {
    return (
      <div className="w-full flex gap-4 overflow-hidden py-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-72 rounded-xl" />
        ))}
      </div>
    );
  }

  // Don't show the carousel if there are fewer than 3 posts
  if (posts.length < 3) {
    return null;
  }

  // We'll use the repeat prop of Marquee instead of duplicating the array
  return (
    <div className="relative w-full my-4 overflow-hidden">
      <Marquee 
        pauseOnHover 
        className="py-2"
        repeat={4}
      >
        {posts.map((post) => (
          <div key={post.id} className="mx-2">
            <PostCard post={post} />
          </div>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
}
