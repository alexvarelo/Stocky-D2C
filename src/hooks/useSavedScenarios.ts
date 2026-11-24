import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import type { Json, Tables } from "@/integrations/supabase/types";

export type ScenarioKind = "stress" | "montecarlo" | "whatif";
export type SavedScenarioRow = Tables<"saved_scenarios">;

export interface SavedScenario extends Omit<SavedScenarioRow, "kind" | "params" | "result_summary"> {
  kind: ScenarioKind;
  params: Record<string, unknown>;
  result_summary: Record<string, unknown>;
}

export interface SavedScenarioInput {
  portfolio_id: string | null;
  name: string;
  kind: ScenarioKind;
  params: Record<string, unknown>;
  /** Headline metrics only, never full curves. */
  result_summary: Record<string, unknown>;
}

const KEY = "saved-scenarios";

export function useSavedScenarios(portfolioId?: string) {
  const { user } = useAuth();
  return useQuery<SavedScenario[]>({
    queryKey: [KEY, user?.id, portfolioId],
    enabled: !!user?.id && !!portfolioId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_scenarios")
        .select("*")
        .eq("user_id", user!.id)
        .eq("portfolio_id", portfolioId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...r,
        kind: r.kind as ScenarioKind,
        params: (r.params ?? {}) as Record<string, unknown>,
        result_summary: (r.result_summary ?? {}) as Record<string, unknown>,
      }));
    },
  });
}

export function useCreateSavedScenario() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (values: SavedScenarioInput) => {
      if (!user?.id) throw new Error("You need to be signed in to save scenarios.");
      const { error } = await supabase.from("saved_scenarios").insert({
        user_id: user.id,
        portfolio_id: values.portfolio_id,
        name: values.name.trim(),
        kind: values.kind,
        params: values.params as Json,
        result_summary: values.result_summary as Json,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      toast({ title: "Scenario saved" });
    },
    onError: (error: Error) =>
      toast({ title: "Could not save scenario", description: error.message, variant: "destructive" }),
  });
}

export function useDeleteSavedScenario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_scenarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
    onError: (error: Error) =>
      toast({ title: "Could not delete scenario", description: error.message, variant: "destructive" }),
  });
}
