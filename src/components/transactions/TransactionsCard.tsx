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
import { format } from "@/lib/dateFormat";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

interface TransactionsCardProps {
  transactions: Transaction[];
  className?: string;
  isLoading?: boolean;
  showHeader?: boolean;
}

const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
  const { t } = useTranslation('portfolio');
  return (
  <div className="rounded-2xl border border-border/50 bg-card/50 p-4">
    <div className="flex items-center justify-between gap-3">
      <Link
        to={`/instrument/${transaction.ticker}`}
        className="flex items-center gap-2.5 min-w-0"
      >
        <CompanyLogo ticker={transaction.ticker} size={30} />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm">{transaction.ticker}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(transaction.transaction_date), "P")}
          </span>
        </div>
      </Link>
      <div className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.transaction_type === "BUY"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        }`}>
        {transaction.transaction_type === "BUY" ? (
          <ArrowDownRight className="h-3 w-3" />
        ) : (
          <ArrowUpRight className="h-3 w-3" />
        )}
        <span>{t(`transactions.types.${transaction.transaction_type}`)}</span>
      </div>
    </div>

    <div className="mt-3 flex items-center justify-between text-xs">
      <span className="text-muted-foreground">
        {t('transactions.sharesAt', { count: transaction.quantity, price: formatCurrency(transaction.price_per_share) })}
      </span>
      <span className="font-semibold text-sm text-foreground">
        {formatCurrency(transaction.quantity * transaction.price_per_share)}
      </span>
    </div>
    {transaction.notes?.trim() && (
      <p className="mt-2 text-xs italic text-muted-foreground break-words">{t('transactions.why', { notes: transaction.notes })}</p>
    )}
  </div>
  );
};

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
  const { t } = useTranslation('portfolio');
  // Show loading state
  if (isLoading) {
    return (
      <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
        {showHeader && (
          <CardHeader className="pb-2 px-0">
            <CardTitle className="text-lg font-medium">{t('transactions.title')}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0">
          {/* Mobile skeleton: stacked cards */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-[30px] w-[30px] rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop skeleton: table */}
          <div className="hidden md:block rounded-3xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="w-[120px] pl-6 h-12 font-medium">{t('transactions.columns.date')}</TableHead>
                  <TableHead className="h-12 font-medium">{t('transactions.columns.type')}</TableHead>
                  <TableHead className="w-[200px] h-12 font-medium">{t('transactions.columns.stock')}</TableHead>
                  <TableHead className="text-right h-12 font-medium">{t('transactions.columns.shares')}</TableHead>
                  <TableHead className="text-right h-12 font-medium">{t('transactions.columns.price')}</TableHead>
                  <TableHead className="text-right pr-6 h-12 font-medium">{t('transactions.columns.total')}</TableHead>
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
            <CardTitle className="text-lg font-medium">{t('transactions.title')}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground text-sm bg-card/50 rounded-3xl border border-border/50 p-8">
            <p>{t('transactions.empty')}</p>
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
            <CardTitle className="text-lg font-medium">{t('transactions.title')}</CardTitle>
            <CardDescription className="text-xs mr-4">
              {transactions.length} record{transactions.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {/* Mobile: stacked cards, no horizontal scroll */}
        <div className="flex flex-col gap-2.5 md:hidden">
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block bg-card/50 border border-border/50 rounded-3xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <TableHead className="w-[120px] pl-6 h-12 font-medium">{t('transactions.columns.date')}</TableHead>
                <TableHead className="h-12 font-medium">{t('transactions.columns.type')}</TableHead>
                <TableHead className="w-[200px] h-12 font-medium">{t('transactions.columns.stock')}</TableHead>
                <TableHead className="text-right h-12 font-medium">{t('transactions.columns.shares')}</TableHead>
                <TableHead className="text-right h-12 font-medium">{t('transactions.columns.price')}</TableHead>
                <TableHead className="text-right pr-6 h-12 font-medium">{t('transactions.columns.total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/30 border-b border-border/50 last:border-0 transition-colors">
                  <TableCell className="pl-6 py-4 text-sm text-muted-foreground">
                    {format(new Date(transaction.transaction_date), "P")}
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
                        {t(`transactions.types.${transaction.transaction_type}`)}
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
                    {transaction.notes?.trim() && (
                      <p className="mt-1 max-w-[260px] truncate text-xs italic text-muted-foreground" title={transaction.notes}>
                        Why: {transaction.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(transaction.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium">{formatCurrency(transaction.price_per_share)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold pr-6">
                    {formatCurrency(transaction.quantity * transaction.price_per_share)}
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
