import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export type TransactionType = 'BUY' | 'SELL';

export interface TransactionFormData {
  portfolio_id: string;
  ticker: string;
  transaction_type: TransactionType;
  quantity: number;
  price_per_share: number;
  transaction_date: string;
  fees?: number;
  notes?: string;
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const { data: result, error } = await supabase
        .rpc('add_transaction', {
          portfolio_uuid: data.portfolio_id,
          ticker_param: data.ticker,
          transaction_type_param: data.transaction_type,
          quantity_param: data.quantity,
          price_per_share_param: data.price_per_share,
          transaction_date_param: data.transaction_date,
          fees_param: data.fees || 0,
          notes_param: data.notes || '',
        });

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      const portfolioId = variables.portfolio_id;
      // Invalidate all related portfolio queries
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-basic", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["stored-portfolio-value", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-prices", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-performance", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["portfolioTransactions", portfolioId] });

      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add transaction',
        variant: 'destructive',
      });
    },
  });
};
