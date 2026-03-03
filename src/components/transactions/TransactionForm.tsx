import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  CalendarIcon,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCreateTransaction,
  type TransactionFormData
} from "@/api/transaction/transaction";
import { useGetStockPriceApiV1StockTickerPriceGet } from "@/api/stock/stock";
import type { PortfolioHolding } from "@/api/portfolio/portfolio";
import { Skeleton } from "@/components/ui/skeleton";
import { StockSearch } from "@/components/stock/StockSearch";
import { usePortfolios } from "@/api/portfolio/usePortfolios";
import { useAuth } from "@/lib/auth";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

const transactionSchema = z.object({
  portfolio_id: z.string().uuid().optional(),
  ticker: z.string().min(1, "Ticker is required"),
  transaction_type: z.enum(["BUY", "SELL"]),
  quantity: z
    .union([
      z.string().min(1, "Quantity is required").transform(Number),
      z.number(),
    ])
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Quantity must be greater than 0",
    }),
  price_per_share: z.number().positive("Price must be greater than 0"),
  transaction_date: z.string().or(z.date()),
  fees: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  portfolioId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  portfolioHoldings?: PortfolioHolding[];
  showPortfolioSelector?: boolean;
  instrumentTicker?: string;
  instrumentName?: string;
  currentPrice?: number;
}

interface SelectedInstrument {
  symbol: string;
  name: string;
  exchange?: string;
}

export function TransactionForm({
  portfolioId,
  onSuccess,
  onCancel,
  portfolioHoldings = [],
  showPortfolioSelector = false,
  instrumentTicker,
  instrumentName,
  currentPrice,
}: TransactionFormProps) {
  const { mutate: createTransaction, isPending } = useCreateTransaction();
  const [selectedInstrument, setSelectedInstrument] = useState<{
    symbol: string;
    name: string;
    exchange?: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth();
  // Fetch user portfolios if portfolio selector is enabled
  const { data: userPortfolios = [], isLoading: isLoadingPortfolios } =
    usePortfolios(user?.id);

  // Use the provided portfolioHoldings or fallback to empty array
  const userHoldings = portfolioHoldings.map((holding) => ({
    symbol: holding.ticker,
    name: holding.ticker, // Using ticker as name since PortfolioHolding doesn't have a name property
    quantity: holding.quantity,
  }));

  // Fetch current price when an instrument is selected
  const { data: priceData, isLoading: isLoadingPrice } =
    useGetStockPriceApiV1StockTickerPriceGet(selectedInstrument?.symbol || "", {
      query: {
        enabled: !!selectedInstrument?.symbol,
        refetchOnWindowFocus: false,
      },
    });

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      portfolio_id: portfolioId || "",
      ticker: instrumentTicker || "",
      transaction_type: "BUY",
      quantity: 1,
      price_per_share: currentPrice || 0,
      transaction_date: new Date().toISOString().split("T")[0],
      fees: 0,
      notes: "",
    },
  });

  // Initialize selected instrument if instrument details are provided
  useEffect(() => {
    if (instrumentTicker && instrumentName) {
      setSelectedInstrument({
        symbol: instrumentTicker,
        name: instrumentName,
      });
      form.setValue("ticker", instrumentTicker);
    }
  }, [instrumentTicker, instrumentName, form]);

  // Watch for changes in the selected ticker to update the available quantity
  const watchTicker = form.watch("ticker");
  const watchTransactionType = form.watch("transaction_type");

  // Get the selected holding when in SELL mode
  const selectedHolding =
    watchTransactionType === "SELL"
      ? portfolioHoldings.find((h) => h.ticker === watchTicker)
      : null;

  // Update form context when transaction type or selected holding changes
  useEffect(() => {
    form.setValue("quantity", 1); // Reset quantity when holding changes
    // Remove form.trigger to prevent infinite loops
  }, [watchTicker, watchTransactionType]);

  const transactionType = form.watch("transaction_type");

  const handleInstrumentSelect = (instrument: SelectedInstrument) => {
    setSelectedInstrument(instrument);
    form.setValue("ticker", instrument.symbol);
    // Auto-fill the price field with the current price if available
    if (priceData?.data?.current_price) {
      form.setValue("price_per_share", priceData.data.current_price);
    }
  };

  const validateSellQuantity = (value: number | string) => {
    if (value === "") return "Quantity is required";
    const numValue = Number(value);
    if (isNaN(numValue)) return "Quantity must be a number";
    if (numValue <= 0) return "Quantity must be greater than 0";

    if (watchTransactionType === "SELL") {
      // Check if we have a pre-selected instrument
      if (instrumentTicker) {
        const instrumentHolding = portfolioHoldings.find((h) => h.ticker === instrumentTicker);
        if (!instrumentHolding) {
          return `You don't hold ${instrumentTicker} in this portfolio`;
        }
        if (numValue > instrumentHolding.quantity) {
          return `Cannot sell more than ${instrumentHolding.quantity} shares`;
        }
      } else if (selectedHolding) {
        // Check against the selected holding from dropdown
        if (numValue > selectedHolding.quantity) {
          return `Cannot sell more than ${selectedHolding.quantity} shares`;
        }
      }
    }
    return true;
  };

  const onSubmit = (data: TransactionFormValues) => {
    // Manual validation for sell quantity
    if (data.transaction_type === "SELL") {
      const validationResult = validateSellQuantity(data.quantity);
      if (validationResult !== true) {
        form.setError("quantity", {
          type: "manual",
          message: validationResult as string,
        });
        return;
      }
    }

    // Validate portfolio_id if portfolio selector is shown
    if (showPortfolioSelector && !data.portfolio_id) {
      form.setError("portfolio_id", {
        type: "manual",
        message: "Portfolio selection is required",
      });
      return;
    }

    const transactionData: TransactionFormData = {
      portfolio_id: data.portfolio_id || portfolioId || "",
      ticker: data.ticker,
      transaction_type: data.transaction_type,
      quantity: data.quantity,
      price_per_share: data.price_per_share,
      transaction_date:
        typeof data.transaction_date === "string"
          ? data.transaction_date
          : data.transaction_date.toISOString().split("T")[0],
      fees: data.fees || 0,
      notes: data.notes || "",
    };

    createTransaction(transactionData, {
      onSuccess: () => {
        form.reset();
        setSelectedInstrument(null);
        onSuccess?.();
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
          {/* Selected Instrument Price Card */}
          {selectedInstrument && (
            <Card className="mb-6">
              <CardContent className="p-4">
                {isLoadingPrice ? (
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-6 w-24 ml-auto" />
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                  </div>
                ) : priceData?.data ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        ticker={selectedInstrument.symbol}
                        companyName={selectedInstrument.name}
                        size={32}
                      />
                      <div>
                        <h3 className="text-lg font-semibold">
                          {selectedInstrument.symbol}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedInstrument.name}
                          {selectedInstrument.exchange &&
                            ` • ${selectedInstrument.exchange}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        ${priceData.data.current_price?.toFixed(2) || "N/A"}
                      </div>
                      {priceData.data.change_percent !== undefined && (
                        <div
                          className={`text-sm flex items-center justify-end ${
                            (priceData.data.change_percent || 0) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {(priceData.data.change_percent || 0) >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                          )}
                          {Math.abs(priceData.data.change_percent || 0).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No price data available
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Controller
                  name="transaction_type"
                  control={form.control}
                  render={({ field }) => (
                    <div className="relative">
                      {/* Background slider */}
                      <div className={`w-full h-10 rounded-full transition-all duration-300 ${
                        field.value === "BUY"
                          ? "bg-green-100 border-2 border-green-300"
                          : "bg-red-100 border-2 border-red-300"
                      }`}>
                        {/* Sliding indicator */}
                        <div className={`absolute top-0 w-1/2 h-full rounded-full transition-transform duration-300 transform ${
                          field.value === "BUY"
                            ? "translate-x-0 bg-green-600"
                            : "translate-x-full bg-red-600"
                        }`}>
                          {/* Optional: Add a small indicator dot or icon */}
                        </div>

                        {/* Text labels positioned absolutely */}
                        <div className="absolute inset-0 flex">
                          <button
                            type="button"
                            className={`flex-1 h-full flex items-center justify-center text-sm font-medium transition-colors duration-200 relative z-10 ${
                              field.value === "BUY"
                                ? "text-white"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                            onClick={() => field.onChange("BUY")}
                          >
                            Buy
                          </button>
                          <button
                            type="button"
                            className={`flex-1 h-full flex items-center justify-center text-sm font-medium transition-colors duration-200 relative z-10 ${
                              field.value === "SELL"
                                ? "text-white"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                            onClick={() => field.onChange("SELL")}
                          >
                            Sell
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>

              {showPortfolioSelector && (
                <div className="grid gap-2">
                  <Label htmlFor="portfolio_id">Portfolio</Label>
                  <Controller
                    name="portfolio_id"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a portfolio" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingPortfolios ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              Loading portfolios...
                            </div>
                          ) : userPortfolios.length > 0 ? (
                            userPortfolios.map((portfolio) => (
                              <SelectItem key={portfolio.id} value={portfolio.id}>
                                {portfolio.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              No portfolios found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.portfolio_id && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.portfolio_id.message}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-2">
                {!instrumentTicker && <Label htmlFor="ticker">Stock Ticker</Label>}
                <div>
                  {transactionType === "SELL" ? (
                    <div className="space-y-2">
                      {instrumentTicker ? (
                        // When instrument is pre-selected, check if user holds it
                        (() => {
                          const instrumentHolding = watchTransactionType === "SELL"
                            ? portfolioHoldings.find((h) => h.ticker === instrumentTicker)
                            : null;

                          return (
                            <div className="space-y-2">
                              {watchTransactionType === "BUY" || instrumentHolding ? (
                                <div className="p-3 border rounded-md bg-muted/20">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <CompanyLogo
                                        ticker={instrumentTicker}
                                        companyName={instrumentName}
                                        size={24}
                                      />
                                      <div>
                                      <p className="font-medium">{instrumentName} ({instrumentTicker})</p>
                                      <p className="text-sm text-muted-foreground">
                                        {watchTransactionType === "BUY"
                                          ? "Selected instrument for buying"
                                          : "Selected instrument for selling"
                                        }
                                      </p>
                                      </div>
                                    </div>
                                    {watchTransactionType === "SELL" && instrumentHolding && (
                                      <div className="text-right">
                                        <p className="text-sm font-medium">Available: {instrumentHolding.quantity.toLocaleString()}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200">
                                  <p className="text-sm text-yellow-800">
                                    You don't currently hold {instrumentTicker} in this portfolio. You can only buy this instrument.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        // When no instrument is pre-selected, show holdings dropdown
                        <>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedInstrument?.symbol || ""}
                            onChange={(e) => {
                              const symbol = e.target.value;
                              if (symbol) {
                                const holding = userHoldings.find(
                                  (h) => h.symbol === symbol
                                );
                                if (holding) {
                                  setSelectedInstrument({
                                    symbol: holding.symbol,
                                    name: holding.name,
                                  });
                                  form.setValue("ticker", holding.symbol);
                                  setSearchQuery(holding.symbol);
                                }
                              } else {
                                setSelectedInstrument(null);
                                form.setValue("ticker", "");
                                setSearchQuery("");
                              }
                            }}
                          >
                            <option value="">Select a holding to sell</option>
                            {isLoadingPortfolios ? (
                              <option disabled>Loading holdings...</option>
                            ) : userHoldings.length > 0 ? (
                              userHoldings.map((holding) => (
                                <option key={holding.symbol} value={holding.symbol}>
                                  {holding.symbol} - {holding.quantity} shares
                                </option>
                              ))
                            ) : (
                              <option disabled>No holdings in this portfolio</option>
                            )}
                          </select>
                          {!isLoadingPortfolios && userHoldings.length === 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                              You don't have any stocks in this portfolio to sell.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ) : instrumentTicker ? null : (
                    <StockSearch
                      onSelect={(instrument) => {
                        setSelectedInstrument({
                          symbol: instrument.symbol,
                          name: instrument.name,
                        });
                        form.setValue("ticker", instrument.symbol);
                        setSearchQuery(instrument.symbol);
                      }}
                    />
                  )}
                </div>
                {form.formState.errors.ticker && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.ticker.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Controller
                  name="quantity"
                  control={form.control}
                  rules={{
                    validate: validateSellQuantity,
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        type="number"
                        min="1"
                        step="any"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          // Validation will happen on form submission
                        }}
                        onBlur={() => {
                          form.trigger("quantity");
                        }}
                      />
                      {/* {fieldState.error && (
                        <p className="text-sm text-destructive mt-1">
                          {fieldState.error.message}
                        </p>
                      )} */}
                    </div>
                  )}
                />
                {form.formState.errors.quantity && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.quantity.message}
                  </p>
                )}
                {watchTransactionType === "SELL" && selectedHolding && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Available: {selectedHolding.quantity.toLocaleString()}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="price_per_share">Price per Share ($)</Label>
                <Input
                  id="price_per_share"
                  type="number"
                  step="0.01"
                  {...form.register("price_per_share", { valueAsNumber: true })}
                />
                {form.formState.errors.price_per_share && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.price_per_share.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="transaction_date">Date</Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("transaction_date") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("transaction_date") ? (
                      format(new Date(form.watch("transaction_date")), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Calendar
                      mode="single"
                      selected={
                        form.watch("transaction_date")
                          ? new Date(String(form.watch("transaction_date")))
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          form.setValue(
                            "transaction_date",
                            date.toISOString().split("T")[0]
                          );
                        }
                      }}
                      initialFocus
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="fees">Fees ($)</Label>
              <Input
                id="fees"
                type="number"
                step="0.01"
                {...form.register("fees", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Add any notes about this transaction"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Footer within the form container */}
      <div className="bg-background  flex justify-end space-x-2 flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className={`h-10 ${
            transactionType === "SELL"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
          disabled={isPending}
          size="sm"
          onClick={form.handleSubmit(onSubmit)}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {transactionType === "SELL" ? "Sell" : "Buy"} Stock
        </Button>
      </div>
    </div>
  );
}
