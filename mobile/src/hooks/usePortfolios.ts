import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Portfolio, Holding, PortfolioValue } from '../types/portfolio';

export function usePortfolios() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_values (
            total_value,
            total_return_percentage,
            updated_at
          ),
          holdings (
            ticker,
            quantity,
            total_invested,
            average_price
          )
        `)
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped: Portfolio[] = (data || []).map((p: any) => ({
        ...p,
        portfolio_values: p.portfolio_values,
        total_value: p.portfolio_values?.total_value || 0,
        total_return_percentage: p.portfolio_values?.total_return_percentage || 0,
        holdings_count: p.holdings?.length || 0,
        total_invested: p.holdings?.reduce(
          (sum: number, h: Holding) => sum + (h.total_invested || 0),
          0
        ) || 0,
        holdings: p.holdings || [],
      }));

      setPortfolios(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return { portfolios, loading, error, refetch: fetchPortfolios };
}

export function usePortfolioDetail(portfolioId: string) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!portfolioId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_values (
            total_value,
            total_return_percentage,
            updated_at
          ),
          holdings (
            ticker,
            quantity,
            total_invested,
            average_price
          )
        `)
        .eq('id', portfolioId)
        .single();

      if (fetchError) throw fetchError;

      const mapped: Portfolio = {
        ...data,
        portfolio_values: data.portfolio_values,
        total_value: data.portfolio_values?.total_value || 0,
        total_return_percentage: data.portfolio_values?.total_return_percentage || 0,
        holdings_count: data.holdings?.length || 0,
        total_invested: data.holdings?.reduce(
          (sum: number, h: Holding) => sum + (h.total_invested || 0),
          0
        ) || 0,
        holdings: (data.holdings || []).sort(
          (a: Holding, b: Holding) =>
            (b.quantity * b.average_price) - (a.quantity * a.average_price)
        ),
      };

      setPortfolio(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, loading, error, refetch: fetchPortfolio };
}
