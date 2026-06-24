export interface Holding {
  ticker: string;
  quantity: number;
  total_invested: number;
  average_price: number;
}

export interface PortfolioValue {
  total_value: number;
  total_return_percentage: number | null;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  holdings: Holding[];
  portfolio_values: PortfolioValue | null;
  total_value: number;
  total_return_percentage: number;
  total_invested: number;
  holdings_count: number;
}
