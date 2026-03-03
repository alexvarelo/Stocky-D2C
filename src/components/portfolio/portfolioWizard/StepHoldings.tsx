import { useState } from "react";
import { Holding, holdingSchema, SearchResult } from "./types";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FormLabel,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-separator";
import { Search, Plus, X, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSearchInstrumentsApiV1SearchGet } from "@/api/search/search";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

interface StepHoldingsProps {
  holdings: Holding[];
  onAddHolding: (holding: Holding) => void;
  onRemoveHolding: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepHoldings({
  holdings,
  onAddHolding,
  onRemoveHolding,
  onBack,
  onSubmit,
  isSubmitting,
}: StepHoldingsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: instrumentsFromSearch, isLoading: isLoadingInstrumentSearch } =
    useSearchInstrumentsApiV1SearchGet(
      {
        query: searchQuery,
        limit: 5,
      },
      {
        query: {
          enabled: searchQuery.length > 2,
        },
      }
    );

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

  const addHolding = (data: z.infer<typeof holdingSchema>) => {
    const newHolding: Holding = {
      ticker: data.ticker,
      company_name: data.company_name,
      quantity: data.quantity,
      average_price: data.average_price,
      notes: data.notes,
    };
    onAddHolding(newHolding);
    holdingForm.reset();
    setSearchQuery("");
  };

  const selectInstrument = (result: SearchResult) => {
    holdingForm.setValue("ticker", result.symbol);
    holdingForm.setValue("company_name", result.name);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
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
                {instrumentsFromSearch?.data?.results?.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => selectInstrument(result)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CompanyLogo ticker={result.symbol} companyName={result.name} size={22} />
                      <div className="min-w-0">
                        <span className="font-medium">{result.symbol}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {result.name}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">{result.exchange}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                            onFocus={(e) => {
                              if (field.value === 0) {
                                e.target.value = "";
                                field.onChange("");
                              }
                            }}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
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
                            onFocus={(e) => {
                              if (field.value === 0) {
                                e.target.value = "";
                                field.onChange("");
                              }
                            }}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
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
                        <Input placeholder="Investment notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" variant="outline" className="w-full">
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
                      <span className="font-medium">{holding.ticker}</span>
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
                    onClick={() => onRemoveHolding(index)}
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
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button onClick={onSubmit} disabled={holdings.length === 0} isLoading={isSubmitting}>
            Create Portfolio
          </Button>
          {/* <Button
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating..."
              : "Create & Add Holdings"}
          </Button> */}
        </div>
      </DialogFooter>
    </div>
  );
}
