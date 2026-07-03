import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { InstrumentChatbot } from "./InstrumentChatbot";
import { StockyLogo } from "@/components/brand/StockyLogo";

interface StockyChatDrawerProps {
  ticker: string;
  isOpen: boolean;
  onOpenChange: (_open: boolean) => void;
  portfolios: Array<{ id: string; name: string }>;
}

export const StockyChatDrawer = ({
  ticker,
  isOpen,
  onOpenChange,
  portfolios,
}: StockyChatDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[80vh] max-h-[800px]">
        <div className="mx-auto w-full max-w-6xl flex flex-col h-full">
          <DrawerHeader className="flex flex-col items-center">
            <div className="mb-2">
              <StockyLogo variant="ink" size={48} />
            </div>
            <DrawerTitle className="text-center text-lg">
              {ticker} Assistant
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden">
            <InstrumentChatbot
              ticker={ticker}
              isOpen={isOpen}
              onClose={() => onOpenChange(false)}
              portfolios={portfolios}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
