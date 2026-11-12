import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioLeaderboard } from "@/components/discover/PortfolioLeaderboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type UserProfile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

const initials = (profile: UserProfile) =>
  (profile.full_name || profile.username || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function CommunityTab() {
  return (
    <div className="space-y-16 md:space-y-[88px]">
      <PortfolioLeaderboard />
      <InvestorDirectory />
    </div>
  );
}

function InvestorDirectory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["discover-users", debouncedQuery],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = supabase.from("users").select("id, username, full_name, avatar_url, bio").neq("id", user.id);
      if (debouncedQuery) {
        // Commas and parentheses are separators in PostgREST's or() syntax.
        const term = debouncedQuery.toLowerCase().replace(/[,()%]/g, " ");
        query = query.or(`username.ilike.%${term}%,full_name.ilike.%${term}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as UserProfile[];
    },
    enabled: !!user?.id,
    placeholderData: (previous) => previous,
  });

  const followingKey = ["discover-following", user?.id];
  const { data: following = {} } = useQuery({
    queryKey: followingKey,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_follows").select("following_id").eq("follower_id", user!.id);
      if (error) throw error;
      return Object.fromEntries((data || []).map((row) => [row.following_id, true])) as Record<string, boolean>;
    },
    enabled: !!user?.id,
  });

  const toggleFollow = async (profile: UserProfile) => {
    if (!user?.id || pending) return;
    const isFollowing = !!following[profile.id];
    setPending(profile.id);
    // Flip the button straight away; put it back if the request fails.
    queryClient.setQueryData<Record<string, boolean>>(followingKey, (prev) => ({
      ...(prev ?? {}),
      [profile.id]: !isFollowing,
    }));
    try {
      const { error } = isFollowing
        ? await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", profile.id)
        : await supabase.from("user_follows").insert([{ follower_id: user.id, following_id: profile.id }]);
      if (error) throw error;
      const name = profile.full_name || `@${profile.username}`;
      toast.success(isFollowing ? `You unfollowed ${name}` : `You're following ${name}`);
    } catch (error) {
      console.error("Error updating follow status:", error);
      queryClient.setQueryData<Record<string, boolean>>(followingKey, (prev) => ({
        ...(prev ?? {}),
        [profile.id]: isFollowing,
      }));
      toast.error("That didn't go through. Try again.");
    } finally {
      setPending(null);
    }
  };

  return (
    <section aria-labelledby="investors-title">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="max-w-2xl">
          <h2
            id="investors-title"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Find investors to follow
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Following someone puts their posts and portfolio updates in your feed.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} role="search" className="relative w-full sm:w-[340px]">
          <label htmlFor="investor-search" className="sr-only">
            Search investors by name or username
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="investor-search"
            type="search"
            placeholder="Name or username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full rounded-[12px] border border-border bg-background pl-12 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground"
          />
        </form>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[120px] rounded-[20px]" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="rounded-[20px] border border-border bg-card p-8 text-center text-muted-foreground">
            {debouncedQuery
              ? `Nobody matches "${debouncedQuery}". Check the spelling or try part of the name.`
              : "No other investors have joined yet."}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {users.map((profile) => {
                const isFollowing = !!following[profile.id];
                const name = profile.full_name || profile.username || "Investor";
                return (
                  <motion.li
                    key={profile.id}
                    layout={!reducedMotion}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-4 rounded-[20px] border border-border bg-card p-5"
                  >
                    <Link
                      to={`/user/${profile.id}`}
                      className="flex min-w-0 flex-1 items-start gap-4 rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={profile.avatar_url || ""} alt="" />
                        <AvatarFallback className="text-sm font-semibold">{initials(profile)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-base font-semibold">{name}</span>
                        <span className="block truncate text-[13px] text-muted-foreground">
                          @{profile.username || "user"}
                        </span>
                        {profile.bio && (
                          <span className="mt-2 line-clamp-2 block text-sm text-muted-foreground">{profile.bio}</span>
                        )}
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleFollow(profile)}
                      disabled={pending === profile.id}
                      aria-pressed={isFollowing}
                      aria-label={isFollowing ? `Unfollow ${name}` : `Follow ${name}`}
                      className={cn(
                        "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 md:h-9",
                        isFollowing
                          ? "bg-secondary text-foreground hover:bg-secondary/70"
                          : "bg-foreground text-background hover:opacity-85"
                      )}
                    >
                      {isFollowing ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      )}
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  );
}
