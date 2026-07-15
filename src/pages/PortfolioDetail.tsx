import { useParams, useNavigate } from "react-router-dom";
import { usePortfolio, useDeletePortfolio } from "@/api/portfolio/portfolio";
import { usePortfolioFollows } from "@/api/portfolio/usePortfolioFollows";
import { usePortfolioTransactions } from "@/api/transaction/usePortfolioTransactions";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { PortfolioHoldings } from "@/components/portfolio/PortfolioHoldings";
import { TransactionsCard } from "@/components/transactions/TransactionsCard";
import { PortfolioEditDialog } from "@/components/portfolio/edit/PortfolioEditDialog";
import { DeleteConfirmationDialog } from "@/components/portfolio/delete/DeleteConfirmationDialog";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRealtimePrices } from "@/api/stock/useRealtimePrices";

// Import from portfolioDetails folder
import { EvolutionChart } from "@/components/portfolio/portfolioDetails/EvolutionChart";
import { AISummaryDrawer } from "@/components/portfolio/portfolioDetails/AISummaryDrawer";
import { PortfolioHero } from "@/components/portfolio/portfolioDetails/PortfolioHero";
import {
  PortfolioLayout,
  PortfolioSection,
  PortfolioLoadingSkeleton
} from "@/components/portfolio/portfolioDetails/PortfolioLayout";
import { AllocationChart } from "@/components/portfolio/portfolioDetails/AllocationChart";
import { TopMovers } from "@/components/portfolio/portfolioDetails/TopMovers";
import { KeyMetrics } from "@/components/portfolio/portfolioDetails/KeyMetrics";
import { PortfolioAwards } from "@/components/portfolio/portfolioDetails/PortfolioAwards";

// Add custom animation keyframes for the spinning gradient
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`;
document.head.appendChild(style);

export const PortfolioDetail = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [aiSummaryOpen, setAISummaryOpen] = useState(false);

  // Load portfolio data
  const {
    data: portfolio,
    isLoading: isLoadingPortfolio,
    isLoadingPrices, // New loading state for prices
    error
  } = usePortfolio(portfolioId);
  const { mutateAsync: deletePortfolio } = useDeletePortfolio();

  // Load transactions in parallel
  const { data: transactions, isLoading: isLoadingTransactions } = usePortfolioTransactions(portfolioId);

  // Follow/unfollow functionality
  const { isFollowing, toggleFollow } = usePortfolioFollows(portfolioId);

  // Real-time prices: subscribe to every held ticker over the market data
  // API's websocket. Only holdings with an actual live tick get overridden --
  // everything else keeps showing the last known price, so this is a pure
  // enhancement (no regression when the market is closed or a ticker is
  // untradeable in real time).
  const tickers = useMemo(
    () => portfolio?.holdings?.map(h => h.ticker) ?? [],
    [portfolio?.holdings]
  );
  const { prices: livePrices } = useRealtimePrices(tickers, !isLoadingPortfolio && tickers.length > 0);

  const holdingsWithLivePrices = useMemo(() => {
    return portfolio?.holdings?.map(h => {
      const live = livePrices[h.ticker.toUpperCase()];
      return live ? { ...h, current_price: live.price } : h;
    });
  }, [portfolio?.holdings, livePrices]);

  const hasLiveTick = tickers.some(t => !!livePrices[t.toUpperCase()]);

  // Calculate derived values
  // Once a live tick has arrived for at least one holding, compute the totals
  // from the live-merged holdings so the page doesn't mix a stale stored
  // total with fresher per-holding prices. Otherwise fall back to the stored
  // values (or the static holdings calculation) as before.
  const totalValue = hasLiveTick
    ? (holdingsWithLivePrices?.reduce((sum, h) => sum + ((h.current_price || 0) * h.quantity), 0) || 0)
    : (portfolio?.total_value ?? (portfolio?.holdings?.reduce(
      (sum, h) => sum + ((h.current_price || 0) * h.quantity),
      0
    ) || 0));

  const totalInvested = portfolio?.holdings?.reduce(
    (sum, h) => sum + h.total_invested,
    0
  ) || 0;

  const totalReturn = totalValue - totalInvested;

  // Use stored return percentage if available, otherwise calculate
  const returnPercentage = hasLiveTick || !portfolio?.total_return_percentage
    ? (totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0)
    : portfolio.total_return_percentage;

  const handleToggleFollow = async () => {
    try {
      await toggleFollow();
      toast({
        title: isFollowing ? 'Unfollowed' : 'Following',
        description: isFollowing
          ? `You unfollowed ${portfolio.name}`
          : `You are now following ${portfolio.name}`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update follow status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!portfolioId) return;

    try {
      await deletePortfolio(portfolioId);
      toast({
        title: "Portfolio deleted",
        description: "Your portfolio has been successfully deleted.",
      });
      navigate("/portfolios");
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete portfolio. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingPortfolio && !portfolio) {
    return <PortfolioLoadingSkeleton />;
  }

  if (error || !portfolio) {
    return (
      <div className="mx-2 sm:mx-1 p-4 sm:p-0">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portfolios
        </Button>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Portfolio not found</h2>
          <p className="text-muted-foreground mb-6">
            The portfolio you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => navigate("/portfolios")}>
            View My Portfolios
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is the owner of the portfolio
  const isOwner = user?.id === portfolio?.user_id;

  const portfolioAgeDays = portfolio?.created_at
    ? Math.floor((new Date().getTime() - new Date(portfolio.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <PortfolioLayout>
      {/* Hero Section */}
      <PortfolioHero
        portfolioId={portfolioId}
        name={portfolio.name}
        description={portfolio.description}
        isPublic={portfolio.is_public}
        followersCount={portfolio.followers_count}
        createdAt={portfolio.created_at}
        totalValue={totalValue}
        totalReturn={totalReturn}
        returnPercentage={returnPercentage}
        todayChange={portfolio.today_change}
        todayChangePercent={portfolio.today_change_percent}
        onBack={() => navigate(-1)}
        onEdit={() => setIsEditDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onAISummary={() => setAISummaryOpen(true)}
        isOwner={isOwner}
        isFollowing={isFollowing}
        onToggleFollow={handleToggleFollow}
        isLoading={isLoadingPortfolio}
        isLoadingPrices={isLoadingPrices}
        isLive={hasLiveTick}
      />

      {/* AI Summary Drawer */}
      <AISummaryDrawer
        isOpen={aiSummaryOpen}
        onOpenChange={setAISummaryOpen}
        portfolioId={portfolioId}
      />

      <PortfolioSection>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Evolution Chart */}
            <EvolutionChart
              holdings={holdingsWithLivePrices || []}
              portfolioId={portfolioId}
              isLoading={isLoadingPrices}
            />

            {/* Holdings List */}
            <PortfolioHoldings
              holdings={holdingsWithLivePrices || []}
              isLoading={isLoadingPortfolio}
              isLoadingPrices={isLoadingPrices}
              livePrices={livePrices}
            />

            {/* Transactions */}
            <TransactionsCard
              transactions={transactions || []}
              isLoading={isLoadingTransactions}
            />
          </div>

          {/* Sidebar Column (1/3) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Allocation Chart */}
            <AllocationChart
              holdings={holdingsWithLivePrices || []}
              isLoading={isLoadingPrices}
            />

            {/* Top Movers */}
            <TopMovers
              holdings={holdingsWithLivePrices || []}
              isLoading={isLoadingPrices}
            />

            {/* Key Metrics */}
            <KeyMetrics
              holdings={holdingsWithLivePrices || []}
              totalInvested={totalInvested}
              isLoading={isLoadingPrices}
            />
          </div>
        </div>

        {/* Awards Section - Moved to bottom */}
        <div className="mt-12">
          <PortfolioAwards
            totalReturn={totalReturn}
            returnPercentage={returnPercentage}
            portfolioAgeDays={portfolioAgeDays}
            holdingsCount={portfolio?.holdings?.length || 0}
            totalValue={totalValue}
            todayChangePercent={portfolio?.today_change_percent || 0}
          />
        </div>
      </PortfolioSection>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Portfolio"
        description="Are you sure you want to delete this portfolio? This action cannot be undone."
        confirmText="Delete Portfolio"
      />

      <PortfolioEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        portfolio={portfolio}
      />
    </PortfolioLayout>
  );
};

// Re-export the PortfolioDetail component as default
export default PortfolioDetail;
