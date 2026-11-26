import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { format } from "@/lib/dateFormat";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetHistoricalDataApiV1StockTickerHistoryGet } from "@/api/stock/stock";
import type { HistoricalDataPoint, HistoricalDataResponse } from "@/api/financialDataApi.schemas";
import { SimpleLineChart } from "@/components/charts/SimpleLineChart";
import { getLocale } from "@/lib/locale";

interface InvestmentSimulatorProps {
  ticker: string;
  currentPrice: number;
  currency: string;
}

export function InvestmentSimulator({ ticker, currentPrice, currency }: InvestmentSimulatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [shares, setShares] = useState<number>(0);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [roi, setRoi] = useState<number>(0);

  // Calculate period based on date range
  const calculatePeriod = (start: Date, end: Date): string => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 5) return '5d';
    if (diffDays <= 30) return '1mo';
    if (diffDays <= 90) return '3mo';
    if (diffDays <= 180) return '6mo';
    if (diffDays <= 365) return '1y';
    if (diffDays <= 365 * 2) return '2y';
    if (diffDays <= 365 * 5) return '5y';
    if (diffDays <= 365 * 10) return '10y';
    return 'max';
  };

  // Fetch historical prices
  const { data: historicalData, isLoading } = useGetHistoricalDataApiV1StockTickerHistoryGet(
    ticker,
    {
      period: calculatePeriod(startDate, endDate),
    },
    {
      query: {
        enabled: !!ticker,
      },
    }
  )

  console.log(historicalData);

  // Calculate investment results when data changes
  useEffect(() => {
    if (!historicalData?.data?.data?.length) return;

    const historicalPrices = historicalData?.data?.data || [];
    const startPrice = historicalPrices[0]?.close || currentPrice;
    const endPrice = historicalPrices[historicalPrices.length - 1]?.close || currentPrice;
    
    const sharesBought = investmentAmount / startPrice;
    const currentInvestmentValue = sharesBought * endPrice;
    const profitValue = currentInvestmentValue - investmentAmount;
    const roiValue = (profitValue / investmentAmount) * 100;

    setShares(sharesBought);
    setCurrentValue(currentInvestmentValue);
    setProfit(profitValue);
    setRoi(roiValue);
  }, [historicalData, investmentAmount, currentPrice]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(getLocale(), {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Investment Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount ({currency})</Label>
              <Input
                id="amount"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                min="1"
                step="1"
              />
              <Slider
                value={[investmentAmount]}
                onValueChange={([value]) => setInvestmentAmount(value)}
                min={100}
                max={100000}
                step={100}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>100 {currency}</span>
                <span>100,000 {currency}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? formatDate(startDate) : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? formatDate(endDate) : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                      disabled={(date) =>
                        date > new Date() || date < startDate
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Initial Investment</span>
                <span className="font-medium">{formatCurrency(investmentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shares Purchased</span>
                <span className="font-medium">{shares.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Value</span>
                <span className="font-medium">{formatCurrency(currentValue)}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit/Loss</span>
                <span className={cn("font-medium", profit >= 0 ? "text-green-500" : "text-red-500")}>
                  {profit >= 0 ? '+' : ''}{formatCurrency(profit)} ({roi.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Investment Growth</h4>
              <div>
                <SimpleLineChart ticker={ticker} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
