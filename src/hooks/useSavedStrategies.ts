import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import type { Json, Tables } from "@/integrations/supabase/types";

export type StrategyKind = "dca" | "rebalance" | "rsi" | "ma_cross";
export type SavedStrategyRow = Tables<"saved_strategies">;

export interface SavedStrategy extends Omit<SavedStrategyRow, "strategy" | "params" | "result_summary"> {
  strategy: StrategyKind;
  params: Record<string, unknown>;
  result_summary: Record<string, unknown>;
}

export interface SavedStrategyInput {
  name: string;
  strategy: StrategyKind;
  params: Record<string, unknown>;
  result_summary: Record<string, unknown>;
}

const KEY = "saved-strategies";

export function useSavedStrategies() {
  const { user } = useAuth();
  return useQuery<SavedStrategy[]>({
    queryKey: [KEY, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_strategies")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...r,
        strategy: r.strategy as StrategyKind,
        params: (r.params ?? {}) as Record<string, unknown>,
        result_summary: (r.result_summary ?? {}) as Record<string, unknown>,
      }));
    },
  });
}

export function useCreateSavedStrategy() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: SavedStrategyInput) => {
      if (!user?.id) throw new Error("You need to be signed in to save strategies.");
      const { error } = await supabase.from("saved_strategies").insert({
        user_id: user.id,
        name: values.name.trim(),
        strategy: values.strategy,
        params: values.params as Json,
        result_summary: values.result_summary as Json,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      toast({ title: "Strategy saved" });
    },
    onError: (error: Error) =>
      toast({ title: "Could not save strategy", description: error.message, variant: "destructive" }),
  });
}

export function useDeleteSavedStrategy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_strategies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
    onError: (error: Error) =>
      toast({ title: "Could not delete strategy", description: error.message, variant: "destructive" }),
  });
}
