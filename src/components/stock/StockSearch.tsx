import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { Instrument } from '@/api/stock/types';
import { useSearchInstrumentsApiV1SearchGet } from '@/api/search/search';
import { CompanyLogo } from '@/components/stock/CompanyLogo';

interface StockSearchProps {
  onSelect: (stock: { symbol: string; name: string }) => void;
  placeholder?: string;
  className?: string;
}

export const StockSearch = ({ 
  onSelect, 
  placeholder = 'Search stocks...',
  className = ''
}: StockSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Instrument[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  const {data: instrumentSearch, isLoading: isLoadingSearch} = useSearchInstrumentsApiV1SearchGet(
    {query: debouncedQuery},
    {
      query: {
        enabled: debouncedQuery.length > 1, // Only run query when there are at least 2 characters
      },
    }
  )

  useEffect(() => {
    if (instrumentSearch?.data) {
      setResults(instrumentSearch.data.results || []);
    } else {
      setResults([]);
    }
  }, [instrumentSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (stock: Instrument) => {
    onSelect({ symbol: stock.symbol, name: stock.name });
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.length > 1) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }}
        placeholder={placeholder}
        className="w-full"
        onFocus={() => query.length > 1 && setIsOpen(true)}
      />
      
      {isLoadingSearch && (
        <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-lg">
          <div className="p-4 text-center text-muted-foreground">
            Searching...
          </div>
        </div>
      )}
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-lg border">
          <ul className="py-1 max-h-60 overflow-auto">
            {results.map((stock) => (
              <li key={stock.symbol}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect(stock)}
                >
                  <div className="flex items-center gap-2">
                    <CompanyLogo ticker={stock.symbol} companyName={stock.name} size={22} />
                    <div className="min-w-0">
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {stock.name}
                        {stock.exchange && ` • ${stock.exchange}`}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isOpen && !isLoadingSearch && results.length === 0 && query && (
        <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-lg">
          <div className="p-4 text-center text-muted-foreground">
            No results found
          </div>
        </div>
      )}
    </div>
  );
};
