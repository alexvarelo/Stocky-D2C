import { useParams, Link } from 'react-router-dom';
import { useWatchlistItems, useRemoveFromWatchlist } from '@/api/watchlist/useWatchlistItems';
// Define the WatchlistItem type since the import is missing
interface WatchlistItem {
  id: string;
  ticker: string;
  name?: string;
  current_price?: number;
  price_change_percentage?: number;
  target_price?: number;
  notes?: string;
}
import { useWatchlists } from '@/api/watchlist/useWatchlists';
import { useSearchInstruments } from '@/api/instruments/useSearchInstruments';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowUpRight, Trash2, Plus, Loader2, Search, Pencil } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { AddToWatchlist } from '@/components/watchlist/AddToWatchlist';
import { EditWatchlistDialog } from '@/components/watchlist/EditWatchlistDialog';
import { Button } from '@/components/ui/button';
import { CompanyLogo } from '@/components/stock/CompanyLogo';

export default function WatchlistDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: watchlists, isLoading: isLoadingWatchlists } = useWatchlists();
  const watchlist = id ? watchlists?.find((w: { id: string }) => w.id === id) : null;
  const isLoadingWatchlist = isLoadingWatchlists;
  const { data: items = [], isLoading: isLoadingItems, refetch: refetchItems } = useWatchlistItems(id || '');
  const removeFromWatchlist = useRemoveFromWatchlist(id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: searchResults = [], isLoading: isSearching } = useSearchInstruments(searchQuery, {
    enabled: searchQuery.length > 1
  });

  if (isLoadingWatchlist) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!watchlist) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Watchlist not found</h1>
        <p className="text-muted-foreground">The requested watchlist could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{watchlist.name}</h1>
            <p className="text-muted-foreground">
              {watchlist.description || 'No description'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={watchlist.is_public ? 'default' : 'secondary'}>
                {watchlist.is_public ? 'Public' : 'Private'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Updated {format(new Date(watchlist.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => setShowEditDialog(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Watchlist
            </Button>
          </div>
        </div>

        {/* Search and Add Stocks Section */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-3">Add stocks to this watchlist</h2>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for stocks to add..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <div className="mt-3 bg-background border rounded-md p-2 max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((instrument) => (
                    <div key={instrument.ticker} className="flex items-center justify-between p-2 hover:bg-accent rounded">
                      <div className="flex flex-1 min-w-0 items-center gap-2">
                        <CompanyLogo ticker={instrument.ticker} companyName={instrument.name} size={24} />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {instrument.name} <span className="text-muted-foreground">({instrument.ticker})</span>
                          </div>
                          {instrument.exchange && (
                            <div className="text-xs text-muted-foreground truncate">
                              {instrument.exchange}
                              {instrument.country && ` • ${instrument.country}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <AddToWatchlist 
                          ticker={instrument.ticker}
                          watchlistId={id}
                          buttonVariant="outline"
                          buttonSize="sm"
                          onAdded={() => {
                            refetchItems();
                            setSearchQuery('');
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length > 1 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Start typing to search for stocks to add to your watchlist
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stocks in this watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingItems ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : items?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No stocks in this watchlist yet. Add some to get started.
              </p>
              <Link 
                to="/instruments"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
              >
                Browse Stocks
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Target Price</TableHead>
                  <TableHead className="text-right">Notes</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: WatchlistItem) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Link 
                        to={`/instrument/${item.ticker}`}
                        className="hover:underline flex items-center group gap-2"
                      >
                        <CompanyLogo ticker={item.ticker} companyName={item.name} size={22} />
                        {item.ticker}
                        <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </TableCell>
                    <TableCell>{item.name || '—'}</TableCell>
                    <TableCell className="text-right">
                      {item.current_price ? `$${item.current_price.toFixed(2)}` : '—'}
                      {item.price_change_percentage !== undefined && (
                        <span 
                          className={`ml-2 text-xs ${item.price_change_percentage >= 0 
                            ? 'text-green-500' 
                            : 'text-red-500'}`}
                        >
                          {item.price_change_percentage >= 0 ? '↑' : '↓'} 
                          {Math.abs(item.price_change_percentage)}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.target_price ? `$${item.target_price.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground max-w-xs truncate">
                      {item.notes || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-destructive h-9 w-9 text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromWatchlist.mutate(item.id);
                        }}
                        disabled={removeFromWatchlist.isPending}
                        title="Remove"
                      >
                        {removeFromWatchlist.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Remove</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditWatchlistDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        watchlist={watchlist}
        onSuccess={() => {
          // The watchlists query will automatically refetch due to the invalidation in the mutation
        }}
      />
    </div>
  );
}
