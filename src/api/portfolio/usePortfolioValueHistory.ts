import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PortfolioValueHistoryPoint {
  snapshot_date: string;
  total_value: number;
  total_cost: number | null;
  total_return_percentage: number | null;
}

/**
 * Daily portfolio value snapshots written by the update-portfolio-values
 * edge function. Reading them is a single indexed query, unlike the legacy
 * client-side calculation that fetched 1y of history per holding.
 */
export const usePortfolioValueHistory = (portfolioId: string | undefined) => {
  return useQuery({
    queryKey: ['portfolio-value-history', portfolioId],
    queryFn: async (): Promise<PortfolioValueHistoryPoint[]> => {
      const { data, error } = await supabase
        .from('portfolio_value_history')
        .select('snapshot_date, total_value, total_cost, total_return_percentage')
        .eq('portfolio_id', portfolioId!)
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!portfolioId,
    staleTime: 60 * 60 * 1000, // snapshots only change once a day
  });
};
