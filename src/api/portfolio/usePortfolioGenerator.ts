import { useMutation } from "@tanstack/react-query";
import { invokeFunction } from "@/api/functions";

export interface GeneratedPortfolioResponse {
    success: boolean;
    portfolio_id: string;
    message: string;
    missing_info?: string[];
}

interface GeneratePortfolioParams {
    prompt: string;
}

export function usePortfolioGenerator() {
    return useMutation<GeneratedPortfolioResponse, Error, GeneratePortfolioParams>({
        mutationFn: ({ prompt }) =>
            invokeFunction<GeneratedPortfolioResponse>("generate-portfolio", { prompt }),
    });
}
