import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PortfolioReceipt, ReceiptHolding } from "./PortfolioReceipt";
import { useExportPortfolio } from "@/hooks/useExportPortfolio";
import { Download, Share2 } from "lucide-react";

interface ExportPortfolioDialogProps {
  isOpen: boolean;
  onOpenChange: (_open: boolean) => void;
  portfolioName: string;
  portfolioDescription?: string;
  holdings: ReceiptHolding[];
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  todayChange: number;
  todayChangePercent: number;
  createdAt?: string;
}

export const ExportPortfolioDialog = ({
  isOpen,
  onOpenChange,
  portfolioName,
  portfolioDescription,
  holdings,
  totalValue,
  totalInvested,
  totalReturn,
  returnPercentage,
  todayChange,
  todayChangePercent,
  createdAt,
}: ExportPortfolioDialogProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { exportAsImage, isExporting } = useExportPortfolio();

  const handleExport = async () => {
    await exportAsImage(receiptRef.current, portfolioName);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${portfolioName} - Portfolio Receipt`,
          text: `Check out my portfolio on Stockfolio!`,
        });
      } catch {
        // user cancelled the share sheet
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Export Portfolio</DialogTitle>
          <DialogDescription>
            Download your portfolio as a shareable receipt image
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-2">
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 max-h-[55vh] overflow-y-auto">
            <PortfolioReceipt
              ref={receiptRef}
              portfolioName={portfolioName}
              portfolioDescription={portfolioDescription}
              holdings={holdings}
              totalValue={totalValue}
              totalInvested={totalInvested}
              totalReturn={totalReturn}
              returnPercentage={returnPercentage}
              todayChange={todayChange}
              todayChangePercent={todayChangePercent}
              createdAt={createdAt}
            />
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Close
          </Button>
          {typeof navigator !== "undefined" && navigator.share && (
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={isExporting}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Download Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
