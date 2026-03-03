import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { PortfolioHolding } from '@/api/portfolio/portfolio';
import { CompanyLogo } from '@/components/stock/CompanyLogo';

type Holding = PortfolioHolding;

interface HoldingsListProps {
  holdings: Holding[];
  onUpdateHolding: (holding: Holding) => Promise<void>;
  onDeleteHolding: (ticker: string) => Promise<void>;
  className?: string;
}

export const HoldingsList = ({ 
  holdings, 
  onUpdateHolding, 
  onDeleteHolding,
  className = '' 
}: HoldingsListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Holding>>({});

  const handleEditClick = (holding: Holding) => {
    setEditingId(holding.ticker);
    setEditValues({ quantity: holding.quantity, average_price: holding.average_price });
  };

  const handleRemove = async (ticker: string) => {
    if (confirm('Are you sure you want to remove this holding?')) {
      await onDeleteHolding(ticker);
    }
  };

  const handleSave = async (holding: PortfolioHolding) => {
    if (editValues.quantity && editValues.average_price) {
      await onUpdateHolding({
        ...holding,
        quantity: editValues.quantity,
        average_price: editValues.average_price,
        total_invested: editValues.quantity * editValues.average_price,
      });
      setEditingId(null);
    }
  };

  if (holdings.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">No holdings in this portfolio yet.</p>;
  }

  return (
    <div className={`border rounded-md ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Avg. Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding) => (
            <TableRow key={holding.ticker}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <CompanyLogo ticker={holding.ticker} size={20} />
                  <span>{holding.ticker}</span>
                </div>
              </TableCell>
              
              {editingId === holding.ticker ? (
                <>
                  <TableCell>
                    <Input
                      type="number"
                      min="0.00000001"
                      step="0.00000001"
                      value={editValues.quantity || ''}
                      onChange={(e) => 
                        setEditValues({...editValues, quantity: parseFloat(e.target.value)})}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0.00000001"
                      step="0.01"
                      value={editValues.average_price || ''}
                      onChange={(e) => 
                        setEditValues({...editValues, average_price: parseFloat(e.target.value)})}
                      className="w-24"
                      prefix="$"
                    />
                  </TableCell>
                  <TableCell>
                    ${((editValues.quantity || 0) * (editValues.average_price || 0)).toFixed(2)}
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSave(holding)}
                    >
                      <span className="sr-only">Save</span>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(null)}
                    >
                      <span className="sr-only">Cancel</span>
                      <span className="text-sm">✕</span>
                    </Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{holding.quantity}</TableCell>
                  <TableCell>${holding.average_price.toFixed(2)}</TableCell>
                  <TableCell>${(holding.quantity * holding.average_price).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(holding)}
                      >
                        <span className="sr-only">Edit</span>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteHolding(holding.ticker)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <span className="sr-only">Delete</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
