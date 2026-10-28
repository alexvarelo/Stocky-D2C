import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/api/functions";

export interface PortfolioLLMSummaryResponse {
  result: {
    overview?: string;
    risks?: { title: string; explanation: string }[];
    considerations?: { title: string; detail: string }[];
    assumptions?: string[];
  };
}

export function usePortfolioAISummary(
  portfolioId?: string,
  enabled: boolean = false
) {
  return useQuery<PortfolioLLMSummaryResponse, Error>({
    queryKey: ["portfolio-ai-summary", portfolioId],
    queryFn: () =>
      invokeFunction<PortfolioLLMSummaryResponse>("portfolio-llm-summarizer", { portfolioId }),
    enabled: !!portfolioId && enabled,
  });
}
