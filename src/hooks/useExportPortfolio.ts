import { useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ui/use-toast";

export const useExportPortfolio = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = useCallback(
    async (elementRef: HTMLElement | null, portfolioName: string) => {
      if (!elementRef) {
        toast({
          title: "Error",
          description: "Could not find portfolio to export",
          variant: "destructive",
        });
        return;
      }

      setIsExporting(true);
      try {
        const canvas = await html2canvas(elementRef, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          // Add a slight delay to ensure rendering is complete
          onclone: (clonedDocument) => {
            // Optional: customize the cloned document before converting
            const clonedElement = clonedDocument.querySelector(
              "[data-export]"
            ) as HTMLElement;
            if (clonedElement) {
              clonedElement.style.background = "#ffffff";
            }
          },
        });

        const link = document.createElement("a");
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${portfolioName}-receipt-${timestamp}.png`;

        link.href = canvas.toDataURL("image/png");
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Export successful",
          description: `Portfolio exported as ${filename}`,
        });
      } catch (error) {
        console.error("Export error:", error);
        toast({
          title: "Export failed",
          description:
            "Could not export portfolio. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsExporting(false);
      }
    },
    [toast]
  );

  return {
    exportAsImage,
    isExporting,
  };
};
