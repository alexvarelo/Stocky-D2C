import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdatePortfolio, useUpdatePortfolioHoldings, useDeletePortfolioHolding } from '@/api/portfolio/portfolio';
import type { Portfolio, PortfolioHolding } from '@/api/portfolio/portfolio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioDetailsForm } from './PortfolioDetailsForm';
import { HoldingsList } from './HoldingsList';
import { AddHoldingForm } from './AddHoldingForm';
import { ImportHoldingsFromCSV } from './ImportHoldingsFromCSV';

interface PortfolioEditDialogProps {
  portfolio: Portfolio;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export const PortfolioEditDialog = ({
  portfolio,
  isOpen,
  onOpenChange,
  onSaved
}: PortfolioEditDialogProps) => {
  const { toast } = useToast();
  const { mutateAsync: updatePortfolio } = useUpdatePortfolio();
  const [activeTab, setActiveTab] = useState<'details' | 'holdings' | 'import'>('details');
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isAddingHolding, setIsAddingHolding] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync: updateHolding } = useUpdatePortfolioHoldings();
  const { mutateAsync: deleteHolding } = useDeletePortfolioHolding();

  // Initialize holdings when portfolio changes
  useEffect(() => {
    if (portfolio?.holdings) {
      setHoldings(portfolio.holdings);
    }
  }, [portfolio]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('details');
      setIsAddingHolding(false);
    }
  }, [isOpen]);

  const handleSave = async (updatedData: Partial<Portfolio>) => {
    try {
      await updatePortfolio({
        portfolioId: portfolio.id,
        portfolioData: updatedData
      });

      toast({
        title: 'Portfolio updated',
        description: 'Your portfolio has been successfully updated.',
      });

      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update portfolio. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleAddHolding = async (holding: Omit<PortfolioHolding, 'current_price' | 'change_percent'>) => {
    try {
      // Create a temporary holding for optimistic UI update
      const tempHoldingId = `temp-${Date.now()}`;
      const newHolding: PortfolioHolding = {
        ...holding,
        current_price: holding.average_price, // Set current price to average price initially
        change_percent: 0, // No change initially
      };

      // Update local state optimistically
      setHoldings(prev => [...prev, newHolding]);

      // Call the API to add the holding
      await updateHolding({
        portfolioId: portfolio.id,
        holding: {
          ticker: holding.ticker,
          quantity: holding.quantity,
          average_price: holding.average_price,
          total_invested: holding.total_invested || (holding.quantity * holding.average_price),
        }
      });

      // Invalidate all related portfolio queries
      const portfolioId = portfolio.id;
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-basic", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["stored-portfolio-value", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-prices", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-performance", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["portfolioTransactions", portfolioId] });

      // Update local state with the actual data from the server
      const updatedPortfolio = queryClient.getQueryData(['portfolio', portfolio.id]) as Portfolio | undefined;
      if (updatedPortfolio?.holdings) {
        setHoldings(updatedPortfolio.holdings);
      }

      setIsAddingHolding(false);

      toast({
        title: 'Holding added',
        description: `${holding.ticker} has been added to your portfolio.`,
      });
    } catch (error) {
      console.error('Error adding holding:', error);

      // Revert optimistic update on error
      setHoldings(prev => prev.filter(h => h.ticker !== holding.ticker));

      toast({
        title: 'Error',
        description: 'Failed to add holding. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleImportHoldings = async (importedHoldings: Array<{
    ticker: string;
    quantity: number;
    average_price: number;
    total_invested: number;
  }>) => {
    try {
      // Process each holding sequentially to avoid rate limiting
      for (const holding of importedHoldings) {
        try {
          await updateHolding({
            portfolioId: portfolio.id,
            holding: {
              ticker: holding.ticker,
              quantity: holding.quantity,
              average_price: holding.average_price,
              total_invested: holding.total_invested || (holding.quantity * holding.average_price),
            }
          });
        } catch (error) {
          console.error(`Error importing holding ${holding.ticker}:`, error);
          // Continue with next holding even if one fails
        }
      }

      // Invalidate all related portfolio queries
      const portfolioId = portfolio.id;
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-basic", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["stored-portfolio-value", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-prices", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-performance", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["portfolioTransactions", portfolioId] });

      // Update local state with the new holdings
      const updatedPortfolio = queryClient.getQueryData(['portfolio', portfolio.id]) as Portfolio | undefined;
      if (updatedPortfolio?.holdings) {
        setHoldings(updatedPortfolio.holdings);
      }

      // Switch back to holdings tab
      setActiveTab('holdings');

      toast({
        title: 'Import successful',
        description: `Successfully imported ${importedHoldings.length} holdings.`,
      });
    } catch (error) {
      console.error('Error during import:', error);
      toast({
        title: 'Import error',
        description: 'Some holdings may not have been imported. Please check the console for details.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateHolding = async (updatedHolding: PortfolioHolding) => {
    try {
      await updateHolding({
        portfolioId: portfolio.id,
        holding: {
          ticker: updatedHolding.ticker,
          quantity: updatedHolding.quantity,
          average_price: updatedHolding.average_price,
          total_invested: updatedHolding.total_invested || (updatedHolding.quantity * updatedHolding.average_price),
        }
      });

      // Invalidate all related portfolio queries
      const portfolioId = portfolio.id;
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-basic", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["stored-portfolio-value", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-prices", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-performance", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["portfolioTransactions", portfolioId] });

      // Update local state with the actual data from the server
      const updatedPortfolio = queryClient.getQueryData(['portfolio', portfolio.id]) as Portfolio | undefined;
      if (updatedPortfolio?.holdings) {
        setHoldings(updatedPortfolio.holdings);
      }

      toast({
        title: 'Holding updated',
        description: `${updatedHolding.ticker} has been updated.`,
      });
    } catch (error) {
      console.error('Error updating holding:', error);
      toast({
        title: 'Error',
        description: 'Failed to update holding. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteHolding = async (ticker: string) => {
    try {
      // Optimistically update the UI
      setHoldings(prev => prev.filter(h => h.ticker !== ticker));

      await deleteHolding({
        portfolioId: portfolio.id,
        ticker
      });

      // Invalidate all related portfolio queries
      const portfolioId = portfolio.id;
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-basic", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["stored-portfolio-value", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-prices", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-performance", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["portfolioTransactions", portfolioId] });

      // Update local state with the actual data from the server
      const updatedPortfolio = queryClient.getQueryData(['portfolio', portfolio.id]) as Portfolio | undefined;
      if (updatedPortfolio?.holdings) {
        setHoldings(updatedPortfolio.holdings);
      }

      toast({
        title: 'Holding removed',
        description: `${ticker} has been removed from your portfolio.`,
      });
    } catch (error) {
      console.error('Error deleting holding:', error);

      // Revert optimistic update on error
      await queryClient.invalidateQueries({ queryKey: ['portfolio', portfolio.id] });
      const updatedPortfolio = queryClient.getQueryData(['portfolio', portfolio.id]) as Portfolio | undefined;
      if (updatedPortfolio?.holdings) {
        setHoldings(updatedPortfolio.holdings);
      }

      toast({
        title: 'Error',
        description: 'Failed to remove holding. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Portfolio</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'details' | 'holdings' | 'import')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" onClick={() => setActiveTab('details')}>
              Portfolio Details
            </TabsTrigger>
            <TabsTrigger value="holdings" onClick={() => setActiveTab('holdings')}>
              Holdings
            </TabsTrigger>
            <TabsTrigger value="import" onClick={() => setActiveTab('import')}>
              Import CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <PortfolioDetailsForm
              portfolio={portfolio}
              onSave={handleSave}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="holdings" className="mt-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Portfolio Holdings</h3>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('import')}
                >
                  Import from CSV
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsAddingHolding(true)}
                  disabled={isAddingHolding}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Holding
                </Button>
              </div>
            </div>

            {isAddingHolding ? (
              <div className="p-4 border rounded-lg">
                <AddHoldingForm
                  onSave={handleAddHolding}
                  onCancel={() => setIsAddingHolding(false)}
                />
              </div>
            ) : (
              <HoldingsList
                holdings={holdings}
                onUpdateHolding={handleUpdateHolding}
                onDeleteHolding={handleDeleteHolding}
              />
            )}
          </TabsContent>

          <TabsContent value="import" className="mt-6">
            <ImportHoldingsFromCSV
              onImport={handleImportHoldings}
              onCancel={() => setActiveTab('holdings')}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
