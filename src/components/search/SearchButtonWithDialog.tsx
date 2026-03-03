import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, ArrowRight, Plus, Clock, BarChart2, Star, Briefcase, List, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSearchInstruments } from "@/api/instruments/useSearchInstruments";
import { usePopularStocks } from "@/api/stock/usePopularStocks";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToWatchlist } from "@/components/watchlist/AddToWatchlist";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useWatchlists } from '@/api/watchlist/useWatchlists';
import { useRecentPortfolios } from '@/hooks/useRecentPortfolios';
import { CompanyLogo } from "@/components/stock/CompanyLogo";

/**
 * SearchButtonWithDialog
 * - Shows a responsive search button (full or icon-only depending on screen size)
 * - Opens a CommandDialog for searching instruments, portfolios, and watchlists
 * - Shows popular stocks, recent portfolios, and watchlists when search is empty
 * - Keyboard shortcut: Cmd+K / Ctrl+K
 */
export function SearchButtonWithDialog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search results using our custom hook
  const { data: searchResults = [], isLoading: isSearching } = useSearchInstruments(
    debouncedQuery,
    {
      enabled: debouncedQuery.length >= 2 // Only fetch if query is 2+ characters
    }
  );

  // Fetch popular stocks
  const { data: popularStocks = [], isLoading: isLoadingPopular } = usePopularStocks({
    enabled: commandOpen && !searchQuery
  });

  // Fetch recent portfolios and watchlists
  const { data: recentPortfolios = [], isLoading: isLoadingRecentPortfolios } = useRecentPortfolios({
    enabled: commandOpen && !!user,
    limit: 3
  });

  // Fetch watchlists
  const { data: watchlists = [], isLoading: isLoadingWatchlists } = useWatchlists();

  // Handle result selection
  const handleSelectResult = useCallback((type: 'instrument' | 'portfolio' | 'watchlist', id: string) => {
    setCommandOpen(false);
    setSearchQuery("");

    switch (type) {
      case 'instrument':
        navigate(`/instrument/${id}`);
        break;
      case 'portfolio':
        navigate(`/portfolio/${id}`);
        break;
      case 'watchlist':
        navigate(`/watchlist/${id}`);
        break;
    }
  }, [navigate]);

  // Focus input when dialog opens
  useEffect(() => {
    if (commandOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [commandOpen]);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Desktop/Tablet: full search button */}
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className={cn(
          "hidden md:inline-flex items-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 relative w-full justify-start text-sm text-muted-foreground sm:pr-16 md:w-32 lg:w-60"
        )}
      >
        <Search className="mr-2 h-4 w-4 shrink-0" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search</span>
        <div className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 sm:flex">
          <kbd className="inline-flex items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 h-5 min-w-[20px]">
            <span className="text-xs">⌘</span>
          </kbd>
          <kbd className="inline-flex items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 h-5 min-w-[20px]">
            K
          </kbd>
        </div>
      </button>
      {/* Mobile: icon-only search button */}
      {/* Mobile: icon-only search button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCommandOpen(true)}
        className="md:hidden h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
      >
        <SearchIcon className="h-5 w-5" />
      </Button>

      <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
        <DialogContent className="p-0 overflow-hidden">
          <Command>
            <CommandInput
              placeholder="Search stocks, ETFs, and more..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-b-0 pb-2"
            />
            <CommandList className="max-h-[400px] overflow-auto">
              {searchQuery.length >= 2 ? (
                // Search results
                isSearching || !searchResults ? (
                  <div className="p-4 space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
                ) : (
                  <CommandGroup heading="Instruments">
                    {searchResults.map((result) => (
                      <CommandItem
                        key={result.ticker}
                        value={`${result.ticker} ${result.name}`}
                        className="relative group"
                        onSelect={() => handleSelectResult('instrument', result.ticker)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1 min-w-0 pr-2 flex items-center gap-2">
                            <CompanyLogo ticker={result.ticker} companyName={result.name} size={24} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {result.name} <span className="text-muted-foreground">({result.ticker})</span>
                              </p>
                              {result.exchange && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.exchange}
                                  {result.country && ` • ${result.country}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <AddToWatchlist
                              ticker={result.ticker}
                              buttonVariant="outline"
                              buttonSize="sm"
                              onAdded={() => {
                                setSearchQuery('');
                                setCommandOpen(false);
                              }}
                            />
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )
              ) : (
                <>
                  {/* Quick Access */}
                  {user && (
                    <>
                      <CommandGroup heading="Quick Access">
                        <CommandItem
                          onSelect={() => {
                            navigate('/portfolios');
                            setCommandOpen(false);
                          }}
                          className="flex items-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors rounded-md px-2 py-1.5"
                        >
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>My Portfolios</span>
                        </CommandItem>
                        <CommandItem
                          onSelect={() => {
                            navigate('/watchlists');
                            setCommandOpen(false);
                          }}
                          className="flex items-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors rounded-md px-2 py-1.5"
                        >
                          <List className="h-4 w-4 text-yellow-500" />
                          <span>My Watchlists</span>
                        </CommandItem>
                      </CommandGroup>
                      <CommandSeparator />
                    </>
                  )}

                  {/* Popular Stocks */}
                  <CommandGroup heading="Popular Stocks">
                    {isLoadingPopular ? (
                      <div className="p-2 space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : popularStocks.length > 0 ? (
                      popularStocks.map((stock) => (
                        <div key={stock.symbol} className="relative group">
                          <div className="flex items-center justify-between w-full px-2">
                            <div
                              className="flex-1 min-w-0 pr-2 py-2 cursor-pointer flex items-center gap-2"
                              onClick={() => handleSelectResult('instrument', stock.symbol)}
                            >
                              <CompanyLogo ticker={stock.symbol} companyName={stock.name} size={24} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {stock.name} <span className="text-muted-foreground">({stock.symbol})</span>
                                </p>
                                {stock.exchange && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {stock.exchange}
                                    {stock.country && ` • ${stock.country}`}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <AddToWatchlist
                                ticker={stock.symbol}
                                buttonVariant="outline"
                                buttonSize="sm"
                                onAdded={() => {
                                  setSearchQuery('');
                                  setCommandOpen(false);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-3 text-center text-sm text-muted-foreground">
                        No popular stocks available
                      </div>
                    )}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
