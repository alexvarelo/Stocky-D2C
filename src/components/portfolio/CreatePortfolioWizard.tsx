import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, X, ArrowLeft, ArrowRight } from "lucide-react";
import { useSearchInstrumentsApiV1SearchGet } from "@/api/search/search";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

const portfolioSchema = z.object({
  name: z.string().min(1, "Portfolio name is required"),
  description: z.string().optional(),
  is_public: z.boolean().default(false),
});

const holdingSchema = z.object({
  ticker: z.string().min(1, "Ticker is required"),
  company_name: z.string().min(1, "Company name is required"),
  quantity: z.number().min(0.000001, "Quantity must be greater than 0"),
  average_price: z.number().min(0.01, "Price must be greater than 0"),
  notes: z.string().optional(),
});

interface SearchResult {
  symbol: string;
  name: string;
  exchange?: string;
  type?: string;
}

interface Holding {
  ticker: string;
  company_name: string;
  quantity: number;
  average_price: number;
  notes?: string;
}

interface CreatePortfolioWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePortfolioWizard = ({
  open,
  onOpenChange,
}: CreatePortfolioWizardProps) => {
  const [step, setStep] = useState(1);
  const [portfolioData, setPortfolioData] = useState<z.infer<
    typeof portfolioSchema
  > | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: instrumentsFromSearch, isLoading: isLoadingInstrumentSearch } =
    useSearchInstrumentsApiV1SearchGet(
      {
        query: searchQuery,
        limit: 5,
      },
      {
        query: {
          enabled: searchQuery.length > 3,
        },
      }
    );

  const portfolioForm = useForm<z.infer<typeof portfolioSchema>>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      name: "",
      description: "",
      is_public: false,
    },
  });

  const holdingForm = useForm<z.infer<typeof holdingSchema>>({
    resolver: zodResolver(holdingSchema),
    defaultValues: {
      ticker: "",
      company_name: "",
      quantity: 0,
      average_price: 0,
      notes: "",
    },
  });

  const selectInstrument = (result: SearchResult) => {
    holdingForm.setValue("ticker", result.symbol);
    holdingForm.setValue("company_name", result.name);
    setSearchQuery("");
  };

  const addHolding = (data: z.infer<typeof holdingSchema>) => {
    const newHolding: Holding = {
      ticker: data.ticker,
      company_name: data.company_name,
      quantity: data.quantity,
      average_price: data.average_price,
      notes: data.notes,
    };
    setHoldings([...holdings, newHolding]);
    holdingForm.reset();
    setSearchQuery("");
  };

  const removeHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const createPortfolioMutation = useMutation({
    mutationFn: async () => {
      if (!user || !portfolioData) throw new Error("Missing data");

      // Create portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        .from("portfolios")
        .insert({
          user_id: user.id,
          name: portfolioData.name,
          description: portfolioData.description,
          is_public: portfolioData.is_public,
        })
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      // Create holdings
      if (holdings.length > 0) {
        const { error: holdingsError } = await supabase.from("holdings").insert(
          holdings.map((holding) => ({
            portfolio_id: portfolio.id,
            ticker: holding.ticker,
            quantity: holding.quantity,
            average_price: holding.average_price,
            notes: holding.notes,
          }))
        );

        if (holdingsError) throw holdingsError;
      }

      return portfolio;
    },
    onSuccess: () => {
      toast({
        title: "Portfolio Created",
        description: "Your portfolio has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
      onOpenChange(false);
      resetWizard();
    },
    onError: (error) => {
      console.error("Error creating portfolio:", error);
      toast({
        title: "Error",
        description: "Failed to create portfolio",
        variant: "destructive",
      });
    },
  });

  const resetWizard = () => {
    setStep(1);
    setPortfolioData(null);
    setHoldings([]);
    portfolioForm.reset();
    holdingForm.reset();
    setSearchQuery("");
  };

  const onPortfolioSubmit = (data: z.infer<typeof portfolioSchema>) => {
    setPortfolioData(data);
    setStep(2);
  };

  const onFinalSubmit = () => {
    createPortfolioMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Create New Portfolio" : "Add Holdings"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Set up your portfolio details"
              : "Import your current holdings to this portfolio"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <Form {...portfolioForm}>
            <form
              onSubmit={portfolioForm.handleSubmit(onPortfolioSubmit)}
              className="space-y-4"
            >
              <FormField
                control={portfolioForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Investment Portfolio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={portfolioForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your investment strategy or goals..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description for your portfolio
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={portfolioForm.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Public Portfolio
                      </FormLabel>
                      <FormDescription>
                        Make this portfolio visible to other users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Search and Add Holdings */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Add Holdings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Search Instruments</FormLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by company name or ticker..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>

                  {isLoadingInstrumentSearch && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-gray-400 rounded-full" />
                      <span className="text-sm text-muted-foreground">
                        Searching…
                      </span>
                    </div>
                  )}
                  {instrumentsFromSearch?.data?.results?.length > 0 && (
                    <div className="border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                      {instrumentsFromSearch?.data?.results?.map(
                        (result, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                            onClick={() => selectInstrument(result)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CompanyLogo ticker={result.symbol} companyName={result.name} size={22} />
                              <div className="min-w-0">
                                <span className="font-medium">
                                  {result.symbol}
                                </span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {result.name}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline">{result.exchange}</Badge>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Only show ticker/company fields if an instrument is selected */}
                {(holdingForm.getValues("ticker") ||
                  holdingForm.getValues("company_name")) && (
                    <Form {...holdingForm}>
                      <form
                        onSubmit={holdingForm.handleSubmit(addHolding)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={holdingForm.control}
                            name="ticker"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ticker</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={
                                      holdingForm.getValues("ticker") || "AAPL"
                                    }
                                    {...field}
                                    readOnly
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={holdingForm.control}
                            name="company_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={
                                      holdingForm.getValues("company_name") ||
                                      "Apple Inc."
                                    }
                                    {...field}
                                    readOnly
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={holdingForm.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.000001"
                                    placeholder="10"
                                    {...field}
                                    onFocus={e => {
                                      if (field.value === 0) {
                                        e.target.value = '';
                                        field.onChange('');
                                      }
                                    }}
                                    onChange={e =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={holdingForm.control}
                            name="average_price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Average Price ($)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="150.00"
                                    {...field}
                                    onFocus={e => {
                                      if (field.value === 0) {
                                        e.target.value = '';
                                        field.onChange('');
                                      }
                                    }}
                                    onChange={e =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={holdingForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Investment notes..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          variant="outline"
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Holding
                        </Button>
                      </form>
                    </Form>
                  )}
              </CardContent>
            </Card>

            {/* Current Holdings */}
            {holdings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Holdings ({holdings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {holdings.map((holding, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CompanyLogo ticker={holding.ticker} companyName={holding.company_name} size={22} />
                            <span className="font-medium">
                              {holding.ticker}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {holding.company_name}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {holding.quantity} shares @ ${holding.average_price}
                            {holding.notes && ` • ${holding.notes}`}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHolding(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onFinalSubmit}>
                  Create Portfolio
                </Button>
                <Button
                  onClick={onFinalSubmit}
                  disabled={createPortfolioMutation.isPending}
                >
                  {createPortfolioMutation.isPending
                    ? "Creating..."
                    : "Create & Add Holdings"}
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
