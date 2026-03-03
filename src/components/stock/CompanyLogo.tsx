import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getCompanyLogoFallback, getCompanyLogoUrl } from "@/lib/companyLogo";

interface CompanyLogoProps {
  ticker: string;
  companyName?: string;
  size?: number;
  className?: string;
  fallbackClassName?: string;
}

export const CompanyLogo = ({
  ticker,
  companyName,
  size = 28,
  className,
  fallbackClassName,
}: CompanyLogoProps) => {
  const [hasError, setHasError] = useState(false);

  const logoUrl = useMemo(
    () =>
      getCompanyLogoUrl(ticker, {
        size: size * 2,
        format: "png",
      }),
    [size, ticker]
  );

  useEffect(() => {
    setHasError(false);
  }, [ticker]);

  const dimensions = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  };

  if (!logoUrl || hasError) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-[10px] font-semibold text-muted-foreground",
          className,
          fallbackClassName
        )}
        style={dimensions}
      >
        {getCompanyLogoFallback(ticker)}
      </span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${companyName || ticker} logo`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      width={size}
      height={size}
      className={cn(
        "inline-block shrink-0 rounded-full border border-border/60 bg-background object-contain p-0.5",
        className
      )}
      style={dimensions}
      onError={() => setHasError(true)}
    />
  );
};
