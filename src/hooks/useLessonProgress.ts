import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Tables } from "@/integrations/supabase/types";

export type LessonProgressRow = Tables<"lesson_progress">;

const KEY = "lesson-progress";

/**
 * All of the user's lesson progress, keyed by lesson id.
 * If the table is missing or unreachable, the query errors and callers just show no progress.
 */
export function useLessonProgress() {
  const { user } = useAuth();
  const query = useQuery<Record<string, LessonProgressRow>>({
    queryKey: [KEY, user?.id],
    enabled: !!user?.id,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.from("lesson_progress").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.lesson_id, r]));
    },
  });
  return { ...query, progress: query.data ?? {}, available: !query.isError };
}

interface QuizResult {
  lessonId: string;
  score: number;
}

/** Saves a finished quiz: marks the lesson completed, keeps the best score and counts the attempt. */
export function useSaveQuizResult() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, score }: QuizResult) => {
      if (!user?.id) throw new Error("Sign in to save your progress.");
      const cached = queryClient.getQueryData<Record<string, LessonProgressRow>>([KEY, user.id])?.[lessonId];
      const { data: fetched, error: selectError } = await supabase
        .from("lesson_progress")
        .select("score, attempts")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      // Never overwrite the best score / attempt count if we could not read them.
      if (selectError) throw selectError;
      const existing = fetched ?? (cached ? { score: cached.score, attempts: cached.attempts } : null);
      const best = Math.max(existing?.score ?? 0, score);
      const { error } = await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          score: best,
          attempts: (existing?.attempts ?? 0) + 1,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}
