import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMultipleStockPricesApiV1StockTickersPricesGet } from "../stock/stock";
import { useToast } from "@/components/ui/use-toast";
import { normalisePence } from "@/lib/portfolioValue";

interface PriceData {
  current: number;
  change?: number;
  changePercent?: number;
  currency?: string;
}

export interface PortfolioHolding {
  ticker: string;
  quantity: number;
  total_invested: number;
  average_price: number;
  currency?: string;
  current_price?: number;
  change_percent?: number;
  today_change?: number;
  today_change_percent?: number;
  today_value_change?: number;
  /** Multiply native-currency amounts by this to get the portfolio's base currency. */
  fx_rate?: number;
}

interface PortfolioBase {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  holdings: PortfolioHolding[];
  portfolio_followers: Array<{ count: number }>;
}

export interface Portfolio extends Omit<PortfolioBase, "portfolio_followers"> {
  followers_count: number;
  today_change?: number;
  today_change_percent?: number;
  performance_data?: {
    dates: string[];
    values: number[];
  };
  total_value?: number;
  total_return_percentage?: number;
  currency?: string;
}

// Get portfolio data with current prices and performance
// This is a combination of basic portfolio data and current market data
export const usePortfolio = (portfolioId: string, includePrices = true) => {
  // 1. Fetch basic portfolio data (Fast)
  const {
    data: basicPortfolio,
    isLoading: isLoadingBasic,
    error: basicError
  } = useQuery<Portfolio, Error>({
    queryKey: ["portfolio-basic", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select(
          `
          *,
          holdings (
            ticker,
            quantity,
            total_invested,
            average_price,
            currency
          ),
          portfolio_follows(count)
        `
        )
        .eq("id", portfolioId)
        .single<PortfolioBase>();

      if (error) throw error;
      if (!data) throw new Error("Portfolio not found");

      return {
        ...data,
        holdings: data.holdings || [],
        followers_count: data.portfolio_followers?.[0]?.count || 0,
      };
    },
    enabled: !!portfolioId,
  });

  // 1b. Fetch stored portfolio value (Fastest for total value)
  const { data: storedValue } = useQuery({
    queryKey: ["stored-portfolio-value", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_values")
        .select("*")
        .eq("portfolio_id", portfolioId)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!portfolioId,
    staleTime: 5 * 60 * 1000,
  });

  // 1c. Fetch stored ticker prices (Fast for individual holdings)
  const tickers = basicPortfolio?.holdings?.map(h => h.ticker) || [];
  const { data: storedPrices } = useQuery({
    queryKey: ["stored-ticker-prices", tickers],
    queryFn: async () => {
      if (!tickers.length) return {};
      const { data, error } = await supabase
        .from("ticker_prices")
        .select("ticker, price, currency, last_updated")
        .in("ticker", tickers);

      if (error) return {};

      const map: Record<string, { price: number; currency?: string }> = {};
      data?.forEach(d => { map[d.ticker] = { price: d.price, currency: d.currency ?? undefined }; });
      return map;
    },
    enabled: tickers.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch live prices for holdings (Slower, but fresher)
  const {
    data: livePrices,
    isLoading: isLoadingLivePrices
  } = useQuery<Record<string, PriceData>, Error>({
    queryKey: ["portfolio-prices", portfolioId],
    queryFn: async () => {
      if (!basicPortfolio?.holdings?.length) return {};

      const tickers = basicPortfolio.holdings.map((h) => h.ticker);
      const pricesMap: Record<string, PriceData> = {};

      try {
        const pricesResponse =
          await getMultipleStockPricesApiV1StockTickersPricesGet(
            tickers.join(",")
          );

        if (Array.isArray(pricesResponse?.data)) {
          pricesResponse.data.forEach((priceData) => {
            if (priceData?.symbol) {
              const { price, currency } = normalisePence(priceData.current_price || 0, priceData.currency);
              const scale = price !== (priceData.current_price || 0) ? 0.01 : 1;
              pricesMap[priceData.symbol] = {
                current: price,
                change: priceData.change != null ? priceData.change * scale : undefined,
                changePercent: priceData.change_percent,
                currency,
              };
            }
          });
        }
      } catch (error) {
        console.error("Error fetching current prices:", error);
      }

      return pricesMap;
    },
    enabled: !!portfolioId && includePrices && !!basicPortfolio?.holdings?.length,
    staleTime: 60 * 1000, // 1 minute for prices
    refetchInterval: 60 * 1000, // Auto-refresh prices every minute
  });

  // 2b. FX rates into the portfolio's base currency. A holding's currency is the one its
  // quote comes in (live, then stored), since that's what the price and average cost were
  // entered in; the holdings.currency column is only the last resort.
  const baseCurrency = storedValue?.currency || "USD";
  const currencyOf = (ticker: string, fallback?: string) =>
    livePrices?.[ticker]?.currency || storedPrices?.[ticker]?.currency || fallback || "USD";
  const foreignCurrencies = [
    ...new Set((basicPortfolio?.holdings ?? []).map((h) => currencyOf(h.ticker, h.currency))),
  ]
    .filter((c) => c !== baseCurrency)
    .sort();
  const { data: fxRates } = useQuery<Record<string, number>>({
    queryKey: ["fx-rates", baseCurrency, foreignCurrencies],
    queryFn: async () => {
      const rates: Record<string, number> = {};
      try {
        const res = await getMultipleStockPricesApiV1StockTickersPricesGet(
          foreignCurrencies.map((c) => `${c}${baseCurrency}=X`).join(",")
        );
        (Array.isArray(res?.data) ? res.data : []).forEach((q) => {
          const from = q?.symbol?.slice(0, 3);
          if (from && q.current_price) rates[from] = q.current_price;
        });
      } catch (error) {
        console.error("Error fetching FX rates:", error);
      }
      return rates;
    },
    enabled: foreignCurrencies.length > 0,
    staleTime: 10 * 60 * 1000,
  });
  const fxRateFor = (currency: string) =>
    currency === baseCurrency ? 1 : fxRates?.[currency] ?? 1;

  // 3. Merge data
  if (!basicPortfolio) {
    return {
      data: undefined,
      isLoading: isLoadingBasic,
      isLoadingPrices: false,
      error: basicError
    };
  }

  // If we have basic data but prices are loading or disabled, return basic data
  // We'll calculate derived values based on what we have
  let totalTodayChange = 0;
  let totalInvested = 0;
  let calculatedTotalValue = 0;

  const holdingsWithPrices = basicPortfolio.holdings.map((holding) => {
    // Priority: Live Price -> Stored Price -> Average Price (fallback)
    const livePriceData = livePrices?.[holding.ticker];
    const storedPrice = storedPrices?.[holding.ticker]?.price;
    const currency = currencyOf(holding.ticker, holding.currency);
    const fxRate = fxRateFor(currency);

    // Determine the price to use
    let currentPrice = 0;
    if (livePriceData) {
      currentPrice = livePriceData.current;
    } else if (storedPrice !== undefined) {
      currentPrice = storedPrice;
    } else {
      currentPrice = holding.average_price; // Fallback
    }

    const investedValue = (holding.average_price || 0) * holding.quantity;
    const currentValue = currentPrice * holding.quantity;

    // Calculate today's value change based on 24h change percentage
    // Only available if we have live data
    const todayChangePercent = livePriceData?.changePercent || 0;
    const todayValueChange = todayChangePercent
      ? (todayChangePercent / 100) *
      (currentValue / (1 + todayChangePercent / 100))
      : 0;

    // Totals are kept in the base currency; the holding's own figures stay native.
    totalTodayChange += todayValueChange * fxRate;
    totalInvested += investedValue * fxRate;
    calculatedTotalValue += currentValue * fxRate;

    return {
      ...holding,
      currency,
      fx_rate: fxRate,
      current_price: currentPrice,
      change_percent:
        holding.average_price > 0
          ? ((currentPrice - holding.average_price) /
            holding.average_price) *
          100
          : 0,
      total_value: currentValue,
      total_invested: investedValue,
      today_change: livePriceData?.change || 0,
      today_change_percent: todayChangePercent,
      today_value_change: todayValueChange,
    };
  });

  // Use stored total value if live calculation isn't ready yet, or if it's more reliable
  // But usually calculated is better if we have individual prices
  // However, if we have a stored value from a background job, it might be good to show that initially

  // If we have live prices, we prefer the calculated value (calculatedTotalValue)
  // If we don't have live prices but have stored prices, we use calculatedTotalValue (based on stored prices)
  // If we have neither, we might want to fall back to the stored total value from the portfolio_values table

  const finalTotalValue = (livePrices && Object.keys(livePrices).length > 0)
    ? calculatedTotalValue
    : (storedValue?.total_value || calculatedTotalValue);

  const finalTotalReturnPercentage = (livePrices && Object.keys(livePrices).length > 0)
    ? (totalInvested > 0 ? ((calculatedTotalValue - totalInvested) / totalInvested) * 100 : 0)
    : (storedValue?.total_return_percentage ?? (totalInvested > 0 ? ((calculatedTotalValue - totalInvested) / totalInvested) * 100 : 0));

  // Today's change is measured against yesterday's value (today's value minus the change),
  // not against the amount invested.
  const previousCloseValue = calculatedTotalValue - totalTodayChange;

  const portfolioWithPrices: Portfolio = {
    ...basicPortfolio,
    holdings: holdingsWithPrices,
    today_change: totalTodayChange,
    today_change_percent: previousCloseValue > 0 ? (totalTodayChange / previousCloseValue) * 100 : 0,
    // If we have a stored total return, we could potentially use it, but calculating from holdings is usually safer for consistency
    total_value: finalTotalValue,
    total_return_percentage: finalTotalReturnPercentage,
    currency: storedValue?.currency || 'USD',
  };

  return {
    data: portfolioWithPrices,
    isLoading: isLoadingBasic,
    isLoadingPrices: isLoadingLivePrices && includePrices && !storedPrices, // Only consider loading if we don't even have stored prices
    error: basicError
  };
};

// Get portfolio performance data (prices, etc.)
export const usePortfolioPerformance = (
  portfolioId: string,
  enabled = true
) => {
  return useQuery<
    {
      holdings: Array<
        PortfolioHolding & { current_price: number; change_percent: number }
      >;
      total_value: number;
      total_change_percent: number;
    },
    Error
  >({
    queryKey: ["portfolio-performance", portfolioId],
    queryFn: async () => {
      // First get the portfolio with holdings
      const { data: portfolio } = await supabase
        .from("portfolios")
        .select(
          `
          id,
          holdings (
            ticker,
            quantity,
            total_invested,
            average_price,
            currency
          )
        `
        )
        .eq("id", portfolioId)
        .single();

      if (!portfolio?.holdings?.length) {
        return { holdings: [], total_value: 0, total_change_percent: 0 };
      }

      // Get current prices for all holdings
      const tickers = portfolio.holdings.map((h) => h.ticker);
      const prices: Record<string, number> = {};

      try {
        const pricesResponse =
          await getMultipleStockPricesApiV1StockTickersPricesGet(
            tickers.join(",")
          );

        if (Array.isArray(pricesResponse?.data)) {
          pricesResponse.data.forEach((priceData) => {
            if (
              priceData?.symbol &&
              priceData.current_price !== null &&
              priceData.current_price !== undefined
            ) {
              prices[priceData.symbol] = priceData.current_price;
            }
          });
        }
      } catch (error) {
        console.error("Error fetching current prices:", error);
        throw error;
      }

      // Calculate performance for each holding
      const holdingsWithPerformance = portfolio.holdings.map((holding) => {
        const currentPrice = prices[holding.ticker] || 0;
        const changePercent =
          holding.average_price > 0
            ? ((currentPrice - holding.average_price) / holding.average_price) *
            100
            : 0;

        return {
          ...holding,
          current_price: currentPrice,
          change_percent: changePercent,
        };
      });

      // Calculate total portfolio value and change
      const totalValue = holdingsWithPerformance.reduce(
        (sum, h) => sum + h.current_price * h.quantity,
        0
      );

      const totalInvested = holdingsWithPerformance.reduce(
        (sum, h) => sum + h.total_invested,
        0
      );

      const totalChangePercent =
        totalInvested > 0
          ? ((totalValue - totalInvested) / totalInvested) * 100
          : 0;

      return {
        holdings: holdingsWithPerformance,
        total_value: totalValue,
        total_change_percent: totalChangePercent,
      };
    },
    enabled: !!portfolioId && enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDeletePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (portfolioId: string) => {
      const { error } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", portfolioId);

      if (error) throw error;
      return true;
    },
    onSuccess: (_, portfolioId) => {
      // Invalidate all related portfolio queries
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-basic", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["stored-portfolio-value", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-prices", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-performance", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
    },
  });
};

// Helper function to update portfolio holdings
const updatePortfolioHoldings = async (
  portfolioId: string,
  updates: Omit<
    PortfolioHolding,
    "current_price" | "change_percent" | "created_at" | "updated_at" | "id"
  >
) => {
  const { data: existingHolding, error: fetchError } = await supabase
    .from("holdings")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("ticker", updates.ticker)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existingHolding) {
    // Update existing holding - whitelist columns explicitly (mirrors the
    // insert branch below) so a caller can never pass through a stray field
    // (e.g. a joined/computed value like current_price) that isn't a real
    // column on this table.
    const { data, error } = await supabase
      .from("holdings")
      .update({
        quantity: updates.quantity || 0,
        total_invested: updates.total_invested || 0,
        average_price: updates.average_price || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingHolding.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Add new holding
    const newHolding = {
      portfolio_id: portfolioId,
      ticker: updates.ticker,
      quantity: updates.quantity || 0,
      total_invested: updates.total_invested || 0,
      average_price: updates.average_price || 0,
      notes: "",
    };

    const { data, error } = await supabase
      .from("holdings")
      .insert(newHolding)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const useUpdatePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      portfolioId,
      portfolioData,
    }: {
      portfolioId: string;
      portfolioData: Partial<Portfolio>;
    }) => {
      const { data, error } = await supabase
        .from("portfolios")
        .update({
          name: portfolioData.name,
          description: portfolioData.description,
          is_public: portfolioData.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq("id", portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const portfolioId = variables.portfolioId;
      // Invalidate and refetch all related portfolio queries
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-basic", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["stored-portfolio-value", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-prices", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-performance", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
    },
  });
};

export const useUpdatePortfolioHoldings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      portfolioId,
      holding,
    }: {
      portfolioId: string;
      holding: Omit<PortfolioHolding, "id" | "created_at" | "updated_at">;
    }) => {
      const data = await updatePortfolioHoldings(portfolioId, holding);
      return data;
    },
    onSuccess: (_, { portfolioId }) => {
      // Invalidate and refetch all related portfolio queries
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-basic", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["stored-portfolio-value", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-prices", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-performance", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });

      toast({
        title: "Holding updated",
        description: "Your portfolio holding has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update holding",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePortfolioHolding = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      portfolioId,
      ticker,
    }: {
      portfolioId: string;
      ticker: string;
    }) => {
      // First get the holding ID
      const { data: holding, error: fetchError } = await supabase
        .from("holdings")
        .select("id")
        .eq("portfolio_id", portfolioId)
        .eq("ticker", ticker)
        .single();

      if (fetchError) throw fetchError;
      if (!holding) throw new Error("Holding not found");

      // Then delete it
      const { error } = await supabase
        .from("holdings")
        .delete()
        .eq("id", holding.id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, { portfolioId }) => {
      // Invalidate and refetch all related portfolio queries
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-basic", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["stored-portfolio-value", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-prices", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-performance", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });

      toast({
        title: "Holding removed",
        description: "The holding has been removed from your portfolio.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove holding",
        variant: "destructive",
      });
    },
  });
};
