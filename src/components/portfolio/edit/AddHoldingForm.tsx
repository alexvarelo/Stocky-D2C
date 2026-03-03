import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { StockSearch } from '@/components/stock/StockSearch';
import type { PortfolioHolding } from '@/api/portfolio/portfolio';
import { CompanyLogo } from '@/components/stock/CompanyLogo';

export type NewHolding = Omit<PortfolioHolding, 'id' | 'created_at' | 'updated_at'>;

interface AddHoldingFormProps {
  onSave: (holding: NewHolding) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const AddHoldingForm = ({ onSave, onCancel, className = '' }: AddHoldingFormProps) => {
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);
  const [quantity, setQuantity] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStock || !quantity || !averagePrice) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
const totalInvested = parseFloat(quantity) * parseFloat(averagePrice);
      
      await onSave({
        ticker: selectedStock.symbol,
        quantity: parseFloat(quantity),
        average_price: parseFloat(averagePrice),
        total_invested: totalInvested,
        current_price: parseFloat(averagePrice), // Initial current price is the same as average
        change_percent: 0, // No change initially
      });
      
      // Reset form
      setSelectedStock(null);
      setQuantity('');
      setAveragePrice('');
      
      toast({
        title: 'Success',
        description: 'Holding added successfully',
      });
    } catch (error) {
      console.error('Error adding holding:', error);
      toast({
        title: 'Error',
        description: 'Failed to add holding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-medium mb-4">Add New Holding</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <StockSearch 
            onSelect={(stock) => setSelectedStock({ symbol: stock.symbol, name: stock.name })}
          />
          {selectedStock && (
            <div className="mt-2 p-2 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <CompanyLogo ticker={selectedStock.symbol} companyName={selectedStock.name} size={20} />
                <div>
                  <div className="font-medium">{selectedStock.symbol}</div>
                  <div className="text-sm text-muted-foreground">{selectedStock.name}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium mb-1">
            Quantity
          </label>
          <Input
            id="quantity"
            type="number"
            min="0.00000001"
            step="0.00000001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00000001"
            required
          />
        </div>
        
        <div>
          <label htmlFor="averagePrice" className="block text-sm font-medium mb-1">
            Average Price ($)
          </label>
          <Input
            id="averagePrice"
            type="number"
            min="0.01"
            step="0.01"
            value={averagePrice}
            onChange={(e) => setAveragePrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedStock || !quantity || !averagePrice}
          >
            {isSubmitting ? 'Adding...' : 'Add Holding'}
          </Button>
        </div>
      </form>
    </div>
  );
};
