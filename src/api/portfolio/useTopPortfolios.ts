import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TopPortfolio {
    id: string;
    name: string;
    description: string | null;
    user_id: string;
    total_value: number;
    total_return_percentage: number;
    holdings_count: number;
    created_at: string;
    top_holding_ticker?: string;
    top_holding_allocation?: number;
    user: {
        id: string;
        username: string;
        full_name: string | null;
        avatar_url: string | null;
    };
}

export interface PortfolioRankingsResult {
    portfolios: TopPortfolio[];
    totalCount: number;
}

interface UseTopPortfoliosOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const useTopPortfolios = (options: UseTopPortfoliosOptions = {}) => {
    const { page = 1, limit = 10, sortBy = 'total_return_percentage', sortOrder = 'desc' } = options;

    return useQuery({
        queryKey: ['top-portfolios', page, limit, sortBy, sortOrder],
        queryFn: async (): Promise<PortfolioRankingsResult> => {
            const { data, error } = await supabase.rpc('get_portfolio_rankings', {
                p_page: page,
                p_limit: limit,
                p_sort_by: sortBy,
                p_sort_order: sortOrder,
                p_public_only: true,
            });

            if (error) throw error;

            if (!data || data.length === 0) {
                return { portfolios: [], totalCount: 0 };
            }

            // The total_count is the same for all rows, so we can get it from the first row
            const totalCount = data[0]?.total_count || 0;

            // Transform the data to match our interface
            const portfolios: TopPortfolio[] = data.map((item) => ({
                id: item.portfolio_id,
                name: item.name,
                description: item.description,
                user_id: item.author_id,
                total_value: item.total_value,
                total_return_percentage: item.total_return_percentage,
                holdings_count: item.holdings_count,
                created_at: item.created_at,
                top_holding_ticker: item.top_holding_ticker,
                top_holding_allocation: item.top_holding_allocation,
                user: {
                    id: item.author_id,
                    username: item.author_username,
                    full_name: item.author_full_name,
                    avatar_url: item.author_avatar_url,
                },
            }));

            return { portfolios, totalCount };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Keep the current list on screen while the next page or sort loads.
        placeholderData: (previous) => previous,
    });
};
