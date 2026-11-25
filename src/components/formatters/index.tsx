import React from 'react';
import { getLocale } from "@/lib/locale";

interface FormattedNumberProps {
  value: number | undefined | null;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  className?: string;
}

export const FormattedNumber: React.FC<FormattedNumberProps> = ({
  value,
  minimumFractionDigits = 0,
  maximumFractionDigits = 2,
  className = ''
}) => {
  if (value === undefined || value === null || isNaN(value)) {
    return <span className={className}>N/A</span>;
  }

  const formattedValue = new Intl.NumberFormat(getLocale(), {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);

  return <span className={className}>{formattedValue}</span>;
};

interface MoneyDisplayProps {
  value: number | undefined | null;
  currency?: string;
  className?: string;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  value,
  currency = 'USD',
  className = ''
}) => {
  if (value === undefined || value === null || isNaN(value)) {
    return <span className={className}>N/A</span>;
  }

  const formattedValue = new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

  return <span className={className}>{formattedValue}</span>;
};

interface PercentageDisplayProps {
  value: number | undefined | null;
  className?: string;
  showSign?: boolean;
}

export const PercentageDisplay: React.FC<PercentageDisplayProps> = ({
  value,
  className = '',
  showSign = true
}) => {
  if (value === undefined || value === null || isNaN(value)) {
    return <span className={className}>N/A</span>;
  }

  const sign = showSign ? (value >= 0 ? '+' : '') : '';
  const formattedValue = `${sign}${(value * 100).toFixed(2)}%`;
  
  return <span className={className}>{formattedValue}</span>;
};

interface LargeNumberDisplayProps {
  value: number | undefined | null;
  currency?: string;
  className?: string;
}

export const LargeNumberDisplay: React.FC<LargeNumberDisplayProps> = ({
  value,
  currency = 'USD',
  className = ''
}) => {
  if (value === undefined || value === null || isNaN(value)) {
    return <span className={className}>N/A</span>;
  }

  let formattedValue: string;
  
  if (value >= 1e12) {
    formattedValue = `${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    formattedValue = `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    formattedValue = `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    formattedValue = `${(value / 1e3).toFixed(2)}K`;
  } else {
    formattedValue = new Intl.NumberFormat(getLocale(), {
      maximumFractionDigits: 2
    }).format(value);
  }

  return <span className={className}>{currency} {formattedValue}</span>;
};

export const PriceChangeDisplay: React.FC<{
  value: number | undefined | null;
  className?: string;
  showIcon?: boolean;
}> = ({ value, className = '', showIcon = true }) => {
  if (value === undefined || value === null || isNaN(value)) {
    return <span className={className}>N/A</span>;
  }

  const isPositive = value >= 0;
  const icon = isPositive ? '↑' : '↓';
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
  const sign = isPositive ? '+' : '';

  return (
    <span className={`inline-flex items-center ${colorClass} ${className}`}>
      {showIcon && <span className="mr-1">{icon}</span>}
      {sign}{Math.abs(value).toFixed(2)}%
    </span>
  );
};

export const CurrencySymbol: React.FC<{ currency: string }> = ({ currency }) => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    // Add more currency symbols as needed
  };

  return <>{symbols[currency] || currency}</>;
};
