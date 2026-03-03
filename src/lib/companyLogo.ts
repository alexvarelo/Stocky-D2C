const LOGO_DEV_TOKEN =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_LOGO_DEV_TOKEN
    ? import.meta.env.VITE_LOGO_DEV_TOKEN
    : process.env.VITE_LOGO_DEV_TOKEN;

interface CompanyLogoOptions {
  size?: number;
  format?: "png" | "jpg" | "webp";
}

export const getCompanyLogoUrl = (
  ticker: string,
  { size = 64, format = "png" }: CompanyLogoOptions = {}
) => {
  if (!ticker?.trim() || !LOGO_DEV_TOKEN) {
    return null;
  }

  const params = new URLSearchParams({
    token: LOGO_DEV_TOKEN,
    size: `${Math.max(16, Math.floor(size))}`,
    format,
  });

  return `https://img.logo.dev/ticker/${encodeURIComponent(
    ticker.toUpperCase()
  )}?${params.toString()}`;
};

export const getCompanyLogoFallback = (ticker: string) => {
  if (!ticker) {
    return "?";
  }

  return ticker.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "?";
};
