import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StepPortfolioDetails } from "./StepPortfolioDetails";
import { StepHoldings } from "./StepHoldings";
import { StepAIGenerator } from "./StepAIGenerator";
import { Holding, portfolioSchema } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { GeneratedPortfolioResponse } from "@/api/portfolio/usePortfolioGenerator";

export type WizardStep = "ai-prompt" | "details" | "holdings";

export function PortfolioWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<WizardStep>("ai-prompt");
  const [portfolioDetails, setPortfolioDetails] = useState<any>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const goToStep = (s: WizardStep) => setStep(s);

  const handleAddHolding = (holding: Holding) => {
    setHoldings((prev) => [...prev, holding]);
  };

  const handleRemoveHolding = (index: number) => {
    setHoldings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAIGenerated = (data: GeneratedPortfolioResponse) => {
    if (data.success) {
      toast({
        title: "Portfolio Created",
        description: "AI has successfully created your portfolio.",
      });
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
      onOpenChange(false);
      resetWizard();
    }
  };

  // Submit wizard (create portfolio & holdings)
  const handleSubmit = async () => {
    if (!user || !portfolioDetails) return;
    setIsSubmitting(true);
    let portfolio = null;
    try {
      // Create portfolio
      const { data, error: portfolioError } = await supabase
        .from("portfolios")
        .insert({
          user_id: user.id,
          name: portfolioDetails.name,
          description: portfolioDetails.description,
          is_public: portfolioDetails.is_public,
        })
        .select()
        .single();
      if (portfolioError) throw portfolioError;
      portfolio = data;

      // Create holdings if any
      if (holdings.length > 0) {
        const { error: holdingsError } = await supabase.from("holdings").insert(
          holdings.map((h) => ({
            portfolio_id: portfolio.id,
            ticker: h.ticker,
            quantity: h.quantity,
            average_price: h.average_price,
            notes: h.notes,
          }))
        );
        if (holdingsError) {
          // Rollback: delete the portfolio
          await supabase.from("portfolios").delete().eq("id", portfolio.id);
          throw holdingsError;
        }
      }
      toast({
        title: "Portfolio Created",
        description: "Your portfolio has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
      onOpenChange(false);
      resetWizard();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create portfolio",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setStep("ai-prompt");
    setPortfolioDetails(null);
    setHoldings([]);
  };

  const getStepTitle = () => {
    switch (step) {
      case "ai-prompt": return "Create New Portfolio";
      case "details": return "Portfolio Details";
      case "holdings": return "Review Holdings";
      default: return "Create Portfolio";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "ai-prompt": return "Let AI build your portfolio or start from scratch";
      case "details": return "Review and customize your portfolio details";
      case "holdings": return "Add or modify holdings in your portfolio";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetWizard();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {step === "ai-prompt" && (
          <StepAIGenerator
            onGenerate={handleAIGenerated}
            onSkip={() => goToStep("details")}
          />
        )}

        {step === "details" && (
          <StepPortfolioDetails
            initialValues={portfolioDetails}
            onNext={(values: any) => {
              setPortfolioDetails(values);
              goToStep("holdings");
            }}
          />
        )}

        {step === "holdings" && (
          <StepHoldings
            holdings={holdings}
            onAddHolding={handleAddHolding}
            onRemoveHolding={handleRemoveHolding}
            onBack={() => goToStep("details")}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
