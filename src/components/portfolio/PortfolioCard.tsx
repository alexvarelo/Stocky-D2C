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

  const todayPercent = portfolioData?.today_change_percent || 0;
  const todayUp = todayPercent >= 0;
  const returnUp = portfolioMetrics.earnedLost >= 0;
  const upPill = 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
  const downPill = 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';

  return (
    <Card className={`group h-full flex flex-col bg-card border-border/60 transition-[border-color,box-shadow] duration-300 hover:border-foreground/20 hover:shadow-lg ${className}`}>
      <Link to={`/portfolio/${id}`} className="flex h-full flex-col rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="text-xl font-bold leading-tight tracking-tight break-words">{name}</CardTitle>
              {showOwner && user_name && user_id && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link
                    to={`/user/${user_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex min-w-0 items-center gap-2 hover:text-primary transition-colors"
                  >
                    {user_avatar_url ? (
                      <img
                        src={user_avatar_url}
                        alt={user_name}
                        className="h-5 w-5 shrink-0 rounded-full ring-1 ring-border"
                      />
                    ) : (
                      <div className="h-5 w-5 shrink-0 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                    )}
                    <span className="truncate font-medium">{user_name}</span>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {!isOwnPortfolio ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted/80"
                  onClick={handleFollowClick}
                  disabled={isFollowLoading || isProcessing}
                  aria-label={isFollowing ? `Unfollow ${name}` : `Follow ${name}`}
                >
                  {isFollowing ? (
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  ) : (
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              ) : (
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground"
                  title="Followers"
                >
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  <span>{followersCount || 0}</span>
                  <span className="sr-only">followers</span>
                </div>
              )}
              <div
                className="h-8 w-8 flex items-center justify-center rounded-full bg-muted/50"
                title={is_public ? 'Public' : 'Private'}
              >
                {is_public ? (
                  <Eye className="h-4 w-4 text-muted-foreground" aria-hidden />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
                )}
                <span className="sr-only">{is_public ? 'Public' : 'Private'}</span>
              </div>
            </div>
          </div>
          {description && (
            <CardDescription className="line-clamp-2 mt-3 text-sm leading-relaxed">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-5">
          {/* Value on its own line so long figures never collide when the card is narrow (zoom, sidebar). */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portfolio value</p>
            {isLoadingPrices ? (
              <Skeleton className="h-8 w-36" />
            ) : (
              <p className="text-2xl font-bold tabular-nums tracking-tight break-all">
                {formatCurrency(portfolioMetrics.currentValue)}
              </p>
            )}
            {isLoadingPrices ? (
              <Skeleton className="h-5 w-28 rounded-full" />
            ) : (
              <span className={`inline-flex flex-wrap items-center gap-x-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${todayUp ? upPill : downPill}`}>
                {todayUp ? '+' : ''}
                {todayPercent.toFixed(2)}%
                <span className="opacity-50" aria-hidden>•</span>
                {formatCurrency(portfolioData?.today_change || 0)}
                <span className="opacity-70">today</span>
              </span>
            )}
          </div>

          <div className="space-y-1 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total return</p>
            {isLoadingPrices ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={`text-sm font-semibold tabular-nums ${returnUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(portfolioMetrics.earnedLost)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${returnUp ? upPill : downPill}`}>
                  {returnUp ? '+' : '−'}
                  {portfolioMetrics.formattedPerformance}%
                </span>
              </span>
            )}
          </div>

          <div className="mt-auto border-t border-border/50 pt-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Holdings</span>
              <span className="rounded bg-muted/50 px-2 py-0.5 text-xs font-semibold">
                {totalHoldings} {totalHoldings === 1 ? 'asset' : 'assets'}
              </span>
            </div>

            {hasHoldings ? (
              <div className="space-y-2">
                {holdings.slice(0, 3).map((holding, index) => (
                  <div key={`${holding.ticker}-${index}`} className="group/holding flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <CompanyLogo ticker={holding.ticker} size={18} />
                      <span className="truncate rounded bg-muted/30 px-1.5 py-0.5 text-xs font-medium transition-colors group-hover/holding:bg-muted/60">
                        {holding.ticker}
                      </span>
                    </div>
                    <span className="truncate text-xs tabular-nums text-muted-foreground">
                      {Number(holding.quantity.toFixed(4)).toLocaleString()} shares
                    </span>
                  </div>
                ))}
                {holdings.length > 3 && (
                  <p className="pl-1 text-xs text-muted-foreground">
                    +{holdings.length - 3} more
                  </p>
                )}
              </div>
            ) : (
              <div className="py-2 text-sm italic text-muted-foreground">No holdings yet</div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-4 text-xs text-muted-foreground">
            <span className="whitespace-nowrap">Created {formattedDate}</span>
            <span className="flex items-center whitespace-nowrap font-medium text-primary transition-transform duration-300 group-hover:translate-x-1">
              Details <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
