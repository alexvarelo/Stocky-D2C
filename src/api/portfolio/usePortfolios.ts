import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  total_value?: number;
  total_return_percentage?: number;
  /** Stored by the twice-daily valuation job, in the owner's base currency. */
  total_cost?: number;
  today_change?: number;
  today_change_percent?: number;
  /** Tickers the job could not price; valued at their last known price or cost. */
  unpriced_tickers?: string[];
  /** When the stored figures were calculated. */
  valued_at?: string;
  currency?: string;
  holdings_count?: number;
  total_invested?: number;
}

export const usePortfolios = (userId?: string) => {
  return useQuery<Portfolio[]>({
    queryKey: ['portfolios', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_values (
            total_value,
            total_return_percentage,
            total_cost,
            today_change,
            today_change_percent,
            unpriced_tickers,
            currency,
            updated_at
          ),
          holdings (
            ticker,
            quantity,
            total_invested,
            currency
          )
        `)
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portfolios:', error);
        throw error;
      }

      // Map the response to include the joined data in the flat structure if needed
      // or just return as is and let the component handle it.
      // For now, let's map it to match the Portfolio interface expectations where possible
      return data.map(p => ({
        ...p,
        total_value: p.portfolio_values?.total_value,
        total_return_percentage: p.portfolio_values?.total_return_percentage,
        total_cost: p.portfolio_values?.total_cost ?? undefined,
        today_change: p.portfolio_values?.today_change ?? undefined,
        today_change_percent: p.portfolio_values?.today_change_percent ?? undefined,
        unpriced_tickers: p.portfolio_values?.unpriced_tickers ?? [],
        valued_at: p.portfolio_values?.updated_at ?? undefined,
        currency: p.portfolio_values?.currency || 'USD',
        holdings_count: p.holdings?.length || 0,
        total_invested: p.holdings?.reduce((sum, h) => sum + (h.total_invested || 0), 0) || 0,
        // We keep the raw arrays too if needed
        holdings: p.holdings
      })) || [];
    },
    enabled: !!userId,
  });
};
