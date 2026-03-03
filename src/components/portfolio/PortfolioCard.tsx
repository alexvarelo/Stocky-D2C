import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Lock, User, Users, Heart, HeartOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { usePortfolioFollows } from '@/api/portfolio/usePortfolioFollows';
import { usePortfolio } from '@/api/portfolio/portfolio';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanyLogo } from '@/components/stock/CompanyLogo';

export interface Holding {
  ticker: string;
  quantity: number;
  average_price?: number;
  current_price?: number;
  total_value?: number;
  total_invested?: number;
}

export interface PortfolioCardProps {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  holdings?: Holding[];
  isFollowing?: boolean;
  showOwner?: boolean;
  user_id?: string;
  user_name?: string;
  user_avatar_url?: string;
  className?: string;
  isOwnPortfolio?: boolean;
  totalValue?: number;
  totalReturnPercentage?: number;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  id,
  name,
  description,
  is_public,
  is_default,
  created_at,
  holdings = [],
  isFollowing: initialIsFollowing = false,
  showOwner = false,
  user_id,
  user_name,
  user_avatar_url,
  className = '',
  isOwnPortfolio,
  totalValue,
  totalReturnPercentage,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isFollowing, toggleFollow, isLoading: isFollowLoading, followersCount } = usePortfolioFollows(id);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth/signin');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await toggleFollow();
      toast({
        title: isFollowing ? 'Unfollowed portfolio' : 'Following portfolio',
        description: isFollowing
          ? `You've unfollowed ${name}`
          : `You're now following ${name}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update follow status',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Get portfolio data with metrics - ONLY if we don't have stored values
  // Or fetch it in background but don't block UI
  const { data: portfolioData, isLoading: isBasicLoading, isLoadingPrices: isPricesLoading } = usePortfolio(id, true);

  // If we have stored values, we are NOT loading
  const hasStoredValues = totalValue !== undefined;
  const isLoadingPrices = !hasStoredValues && (isBasicLoading || isPricesLoading);

  // Calculate portfolio metrics from portfolio data
  const portfolioMetrics = useMemo(() => {
    // If we have stored values, use them!
    if (hasStoredValues) {
      return {
        currentValue: totalValue || 0,
        costBasis: 0,
        earnedLost: totalValue * (totalReturnPercentage || 0) / 100,
        isPositive: (totalReturnPercentage || 0) >= 0,
        formattedPerformance: Math.abs(totalReturnPercentage || 0).toFixed(2)
      };
    }

    if (!portfolioData?.holdings?.length) {
      return {
        currentValue: 0,
        costBasis: 0,
        earnedLost: 0,
        isPositive: true,
        formattedPerformance: '0.00'
      };
    }

    const { currentValue, costBasis } = portfolioData.holdings.reduce<{ currentValue: number; costBasis: number }>(
      (acc, holding) => {
        const price = holding.current_price || 0;
        return {
          currentValue: acc.currentValue + (price * holding.quantity),
          costBasis: acc.costBasis + ((holding.average_price || 0) * holding.quantity)
        };
      },
      { currentValue: 0, costBasis: 0 }
    );

    const earnedLost = currentValue - costBasis;
    const performance = costBasis > 0 ? earnedLost / costBasis : 0;

    return {
      currentValue,
      costBasis,
      earnedLost,
      isPositive: earnedLost >= 0,
      formattedPerformance: (Math.abs(performance) * 100).toFixed(2)
    };
  }, [portfolioData, totalValue, totalReturnPercentage, hasStoredValues]);


  // Calculate total number of holdings
  const totalHoldings = holdings?.length || 0;
  const hasHoldings = totalHoldings > 0;

  // Format creation date
  const formattedDate = useMemo(() => {
    try {
      return format(new Date(created_at), 'MMM d, yyyy');
    } catch (e) {
      return '';
    }
  }, [created_at]);

  return (
    <Card className={`hover:shadow-xl transition-all duration-300 group h-full flex flex-col border-border/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50 ${className}`}>
      <Link to={`/portfolio/${id}`} className="block h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-bold tracking-tight">{name}</CardTitle>
              {showOwner && user_name && user_id && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link
                    to={`/user/${user_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {user_avatar_url ? (
                      <img
                        src={user_avatar_url}
                        alt={user_name}
                        className="h-5 w-5 rounded-full ring-1 ring-border"
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                    )}
                    <span className="font-medium">{user_name}</span>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {!isOwnPortfolio ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted/80"
                  onClick={handleFollowClick}
                  disabled={isFollowLoading || isProcessing}
                >
                  {isFollowing ? (
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  ) : (
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{followersCount || 0}</span>
                </div>
              )}
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted/50">
                {is_public ? (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
          {description && (
            <CardDescription className="line-clamp-2 mt-3 text-sm leading-relaxed">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6 flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            {/* Portfolio Value and Today's Performance */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Portfolio Value</p>
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight">
                  {isLoadingPrices ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    formatCurrency(portfolioMetrics.currentValue)
                  )}
                </p>
                <div className="flex items-center">
                  {isLoadingPrices ? (
                    <Skeleton className="h-5 w-20 rounded-full" />
                  ) : (
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${(portfolioData?.today_change_percent || 0) >= 0
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                      {(portfolioData?.today_change_percent || 0) >= 0 ? '+' : ''}
                      {(portfolioData?.today_change_percent || 0).toFixed(2)}%
                      <span className="mx-1 opacity-50">•</span>
                      {formatCurrency(portfolioData?.today_change || 0)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Total Return */}
            <div className="space-y-1 text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Return</p>
              <div className="space-y-1 flex flex-col items-end">
                <p className={`text-lg font-semibold ${!isLoadingPrices && (portfolioMetrics.earnedLost >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                  }`}>
                  {isLoadingPrices ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    formatCurrency(portfolioMetrics.earnedLost)
                  )}
                </p>
                {isLoadingPrices ? (
                  <Skeleton className="h-5 w-16 rounded-full" />
                ) : (
                  <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${portfolioMetrics.earnedLost >= 0
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                    }`}>
                    {portfolioMetrics.earnedLost >= 0 ? '+' : ''}
                    {portfolioMetrics.formattedPerformance}%
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 mt-auto">
            <div className="flex justify-between items-center text-sm mb-3">
              <span className="font-medium text-muted-foreground">Holdings</span>
              <span className="font-semibold bg-muted/50 px-2 py-0.5 rounded text-xs">
                {totalHoldings} {totalHoldings === 1 ? 'asset' : 'assets'}
              </span>
            </div>

            {hasHoldings ? (
              <div className="space-y-2">
                {holdings.slice(0, 3).map((holding, index) => (
                  <div key={`${holding.ticker}-${index}`} className="flex justify-between items-center text-sm group/holding">
                    <div className="flex items-center gap-2">
                      <CompanyLogo ticker={holding.ticker} size={18} />
                      <span className="font-medium bg-muted/30 px-1.5 py-0.5 rounded text-xs group-hover/holding:bg-muted/60 transition-colors">
                        {holding.ticker}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">{holding.quantity} shares</span>
                  </div>
                ))}
                {holdings.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-1">
                    +{holdings.length - 3} more
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic py-2">No holdings yet</div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50">
            <span>Created {formattedDate}</span>
            <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
              Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
