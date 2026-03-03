import { Transaction } from "@/api/transaction/usePortfolioTransactions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

interface TransactionsCardProps {
  transactions: Transaction[];
  className?: string;
  isLoading?: boolean;
  showHeader?: boolean;
}

const TransactionRowSkeleton = () => (
  <TableRow className="hover:bg-transparent border-b border-border/50 last:border-0">
    <TableCell className="pl-6 py-4">
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-12 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell className="text-right">
      <Skeleton className="h-4 w-12 ml-auto" />
    </TableCell>
    <TableCell className="text-right">
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-4 w-16" />
      </div>
    </TableCell>
    <TableCell className="text-right pr-6">
      <Skeleton className="h-4 w-20 ml-auto" />
    </TableCell>
  </TableRow>
);

export function TransactionsCard({
  transactions,
  className,
  isLoading = false,
  showHeader = true,
}: TransactionsCardProps) {
  // Show loading state
  if (isLoading) {
    return (
      <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
        {showHeader && (
          <CardHeader className="pb-2 px-0">
            <CardTitle className="text-lg font-medium">Transactions</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0">
          <div className="rounded-3xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="w-[120px] pl-6 h-12 font-medium">Date</TableHead>
                  <TableHead className="h-12 font-medium">Type</TableHead>
                  <TableHead className="w-[200px] h-12 font-medium">Stock</TableHead>
                  <TableHead className="text-right h-12 font-medium">Shares</TableHead>
                  <TableHead className="text-right h-12 font-medium">Price</TableHead>
                  <TableHead className="text-right pr-6 h-12 font-medium">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TransactionRowSkeleton key={i} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state
  if (!transactions || transactions.length === 0) {
    return (
      <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
        {showHeader && (
          <CardHeader className="pb-2 px-0">
            <CardTitle className="text-lg font-medium">Transactions</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground text-sm bg-card/50 rounded-3xl border border-border/50 p-8">
            <p>No transactions have been recorded for this portfolio yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
      {showHeader && (
        <CardHeader className="pb-2 px-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Transactions</CardTitle>
            <CardDescription className="text-xs mr-4">
              {transactions.length} record{transactions.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="bg-card/50 border border-border/50 rounded-3xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <TableHead className="w-[120px] pl-6 h-12 font-medium">Date</TableHead>
                <TableHead className="h-12 font-medium">Type</TableHead>
                <TableHead className="w-[200px] h-12 font-medium">Stock</TableHead>
                <TableHead className="text-right h-12 font-medium">Shares</TableHead>
                <TableHead className="text-right h-12 font-medium">Price</TableHead>
                <TableHead className="text-right pr-6 h-12 font-medium">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/30 border-b border-border/50 last:border-0 transition-colors">
                  <TableCell className="pl-6 py-4 text-sm text-muted-foreground">
                    {format(new Date(transaction.transaction_date), "MM/dd/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.transaction_type === "BUY"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}>
                      {transaction.transaction_type === "BUY" ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      <span className="capitalize">
                        {transaction.transaction_type.toLowerCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Link
                      to={`/instrument/${transaction.ticker}`}
                      className="font-semibold text-sm hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <CompanyLogo ticker={transaction.ticker} size={22} />
                      {transaction.ticker}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {transaction.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium">${transaction.price_per_share.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold pr-6">
                    ${(transaction.quantity * transaction.price_per_share).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
