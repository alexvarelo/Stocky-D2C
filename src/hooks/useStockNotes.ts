import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type StockNote = Tables<"stock_notes">;

const notesKey = (userId: string | undefined, ticker: string) => ["stock-notes", userId, ticker.toUpperCase()];

export function useStockNotes(ticker?: string) {
  const { user } = useAuth();
  const symbol = (ticker || "").toUpperCase();

  return useQuery<StockNote[]>({
    queryKey: notesKey(user?.id, symbol),
    enabled: !!user?.id && !!symbol,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_notes")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ticker", symbol)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateStockNote(ticker: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const symbol = ticker.toUpperCase();

  return useMutation({
    mutationFn: async (body: string) => {
      if (!user?.id) throw new Error("You need to be signed in to save notes.");
      const { data, error } = await supabase
        .from("stock_notes")
        .insert({ user_id: user.id, ticker: symbol, body })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notesKey(user?.id, symbol) }),
    onError: (error: Error) =>
      toast({ title: "Could not save note", description: error.message, variant: "destructive" }),
  });
}

export function useUpdateStockNote(ticker: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const symbol = ticker.toUpperCase();

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      const { data, error } = await supabase
        .from("stock_notes")
        .update({ body, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notesKey(user?.id, symbol) }),
    onError: (error: Error) =>
      toast({ title: "Could not update note", description: error.message, variant: "destructive" }),
  });
}

export function useDeleteStockNote(ticker: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const symbol = ticker.toUpperCase();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stock_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notesKey(user?.id, symbol) }),
    onError: (error: Error) =>
      toast({ title: "Could not delete note", description: error.message, variant: "destructive" }),
  });
}
