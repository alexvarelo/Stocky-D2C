import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "@/lib/dateFormat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type ThesisRow = Tables<"investment_theses">;
export type ThesisStatus = "active" | "closed" | "invalidated";
export type ThesisHorizon = "short" | "medium" | "long";

export interface InvestmentThesis extends Omit<ThesisRow, "status" | "horizon"> {
  status: ThesisStatus;
  horizon: ThesisHorizon | null;
}

export interface ThesisInput {
  ticker: string;
  portfolio_id: string | null;
  why_bought: string;
  catalysts: string[];
  exit_triggers: string[];
  horizon: ThesisHorizon | null;
  review_date: string | null;
  status: ThesisStatus;
}

export const THESIS_MAX_WHY = 5000;
export const THESIS_MAX_LIST_ITEMS = 20;

const THESES_KEY = "investment-theses";

const normalize = (rows: ThesisRow[] | null): InvestmentThesis[] =>
  (rows ?? []).map((r) => ({
    ...r,
    catalysts: r.catalysts ?? [],
    exit_triggers: r.exit_triggers ?? [],
    status: r.status as ThesisStatus,
    horizon: (r.horizon as ThesisHorizon | null) ?? null,
  }));

/** All of the user's theses for a ticker (any portfolio, any status), newest first. */
export function useThesesByTicker(ticker?: string) {
  const { user } = useAuth();
  const symbol = (ticker || "").toUpperCase();
  return useQuery<InvestmentThesis[]>({
    queryKey: [THESES_KEY, "ticker", user?.id, symbol],
    enabled: !!user?.id && !!symbol,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_theses")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ticker", symbol)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return normalize(data);
    },
  });
}

/** All of the user's theses linked to a portfolio. */
export function useThesesByPortfolio(portfolioId?: string) {
  const { user } = useAuth();
  return useQuery<InvestmentThesis[]>({
    queryKey: [THESES_KEY, "portfolio", user?.id, portfolioId],
    enabled: !!user?.id && !!portfolioId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_theses")
        .select("*")
        .eq("user_id", user!.id)
        .eq("portfolio_id", portfolioId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return normalize(data);
    },
  });
}

/**
 * Theses that apply to a position: those linked to this portfolio plus general ones
 * (portfolio_id null) for the same ticker. Portfolio-specific theses come first.
 */
export function useThesesForPosition(ticker?: string, portfolioId?: string) {
  const { user } = useAuth();
  const symbol = (ticker || "").toUpperCase();
  return useQuery<InvestmentThesis[]>({
    queryKey: [THESES_KEY, "position", user?.id, portfolioId, symbol],
    enabled: !!user?.id && !!portfolioId && !!symbol,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_theses")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ticker", symbol)
        .or(`portfolio_id.eq.${portfolioId},portfolio_id.is.null`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = normalize(data);
      return [...rows.filter((t) => t.portfolio_id === portfolioId), ...rows.filter((t) => t.portfolio_id !== portfolioId)];
    },
  });
}

/** Active theses whose review_date is today or earlier. */
export function useThesesDueForReview() {
  const { user } = useAuth();
  return useQuery<InvestmentThesis[]>({
    queryKey: [THESES_KEY, "due", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("investment_theses")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .not("review_date", "is", null)
        .lte("review_date", today)
        .order("review_date", { ascending: true });
      if (error) throw error;
      return normalize(data);
    },
  });
}

export function useSaveThesis() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: ThesisInput }) => {
      if (!user?.id) throw new Error("You need to be signed in to save a thesis.");
      const payload = { ...values, ticker: values.ticker.toUpperCase() };
      if (id) {
        const { error } = await supabase
          .from("investment_theses")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("investment_theses")
          .insert({ ...payload, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [THESES_KEY] }),
    onError: (error: Error & { code?: string }) =>
      toast({
        title: "Could not save thesis",
        description:
          error.code === "23505"
            ? "You already have an active thesis for this position — edit or close it first."
            : error.message,
        variant: "destructive",
      }),
  });
}

export function useUpdateThesisStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ThesisStatus }) => {
      const { error } = await supabase
        .from("investment_theses")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [THESES_KEY] }),
    onError: (error: Error & { code?: string }) =>
      toast({
        title: "Could not update thesis",
        description:
          error.code === "23505"
            ? "You already have an active thesis for this position — edit or close it first."
            : error.message,
        variant: "destructive",
      }),
  });
}

export function useDeleteThesis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("investment_theses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [THESES_KEY] }),
    onError: (error: Error) =>
      toast({ title: "Could not delete thesis", description: error.message, variant: "destructive" }),
  });
}

export function isThesisDue(thesis: Pick<InvestmentThesis, "status" | "review_date">): boolean {
  if (thesis.status !== "active" || !thesis.review_date) return false;
  return thesis.review_date <= format(new Date(), "yyyy-MM-dd");
}
