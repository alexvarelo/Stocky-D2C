// The household names shown on the Discover globe. Each sits at its
// headquarters, so the map reads as "where the companies you know live".

export type RegionId = "all" | "americas" | "europe" | "asia";
export type Sector =
  | "Technology"
  | "Consumer"
  | "Finance"
  | "Health"
  | "Energy"
  | "Industry"
  | "Media";

export interface WorldCompany {
  /** Ticker as the market data API expects it. */
  symbol: string;
  /** Short ticker for display (no exchange suffix). */
  label: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  region: Exclude<RegionId, "all">;
  sector: Sector;
  exchange: ExchangeId;
}

export type ExchangeId = "NYC" | "LON" | "EUR" | "TYO" | "HKG" | "BOM" | "SYD" | "SEL" | "RUH";

export const REGIONS: { id: RegionId; label: string; focus: [number, number] }[] = [
  // focus = [lng, lat] the globe turns to
  { id: "all", label: "Worldwide", focus: [-20, 38] },
  { id: "americas", label: "Americas", focus: [-98, 36] },
  { id: "europe", label: "Europe", focus: [8, 48] },
  { id: "asia", label: "Asia-Pacific", focus: [118, 26] },
];

export const SECTORS: Sector[] = [
  "Technology",
  "Consumer",
  "Finance",
  "Health",
  "Energy",
  "Industry",
  "Media",
];

export const WORLD_COMPANIES: WorldCompany[] = [
  // ── Americas
  { symbol: "AAPL", label: "AAPL", name: "Apple", city: "Cupertino", country: "United States", lat: 37.33, lng: -122.03, region: "americas", sector: "Technology", exchange: "NYC" },
  { symbol: "MSFT", label: "MSFT", name: "Microsoft", city: "Redmond", country: "United States", lat: 47.67, lng: -122.12, region: "americas", sector: "Technology", exchange: "NYC" },
  { symbol: "NVDA", label: "NVDA", name: "NVIDIA", city: "Santa Clara", country: "United States", lat: 37.37, lng: -121.96, region: "americas", sector: "Technology", exchange: "NYC" },
  { symbol: "GOOGL", label: "GOOGL", name: "Alphabet", city: "Mountain View", country: "United States", lat: 37.42, lng: -122.08, region: "americas", sector: "Technology", exchange: "NYC" },
  { symbol: "AMZN", label: "AMZN", name: "Amazon", city: "Seattle", country: "United States", lat: 47.61, lng: -122.33, region: "americas", sector: "Consumer", exchange: "NYC" },
  { symbol: "META", label: "META", name: "Meta", city: "Menlo Park", country: "United States", lat: 37.48, lng: -122.15, region: "americas", sector: "Technology", exchange: "NYC" },
  { symbol: "TSLA", label: "TSLA", name: "Tesla", city: "Austin", country: "United States", lat: 30.22, lng: -97.62, region: "americas", sector: "Industry", exchange: "NYC" },
  { symbol: "NFLX", label: "NFLX", name: "Netflix", city: "Los Gatos", country: "United States", lat: 37.26, lng: -121.96, region: "americas", sector: "Media", exchange: "NYC" },
  { symbol: "JPM", label: "JPM", name: "JPMorgan Chase", city: "New York", country: "United States", lat: 40.76, lng: -73.98, region: "americas", sector: "Finance", exchange: "NYC" },
  { symbol: "V", label: "V", name: "Visa", city: "San Francisco", country: "United States", lat: 37.79, lng: -122.4, region: "americas", sector: "Finance", exchange: "NYC" },
  { symbol: "BRK-B", label: "BRK.B", name: "Berkshire Hathaway", city: "Omaha", country: "United States", lat: 41.26, lng: -95.94, region: "americas", sector: "Finance", exchange: "NYC" },
  { symbol: "WMT", label: "WMT", name: "Walmart", city: "Bentonville", country: "United States", lat: 36.37, lng: -94.21, region: "americas", sector: "Consumer", exchange: "NYC" },
  { symbol: "KO", label: "KO", name: "Coca-Cola", city: "Atlanta", country: "United States", lat: 33.77, lng: -84.4, region: "americas", sector: "Consumer", exchange: "NYC" },
  { symbol: "MCD", label: "MCD", name: "McDonald's", city: "Chicago", country: "United States", lat: 41.88, lng: -87.65, region: "americas", sector: "Consumer", exchange: "NYC" },
  { symbol: "NKE", label: "NKE", name: "Nike", city: "Beaverton", country: "United States", lat: 45.51, lng: -122.83, region: "americas", sector: "Consumer", exchange: "NYC" },
  { symbol: "DIS", label: "DIS", name: "Disney", city: "Burbank", country: "United States", lat: 34.16, lng: -118.33, region: "americas", sector: "Media", exchange: "NYC" },
  { symbol: "PFE", label: "PFE", name: "Pfizer", city: "New York", country: "United States", lat: 40.75, lng: -74.0, region: "americas", sector: "Health", exchange: "NYC" },
  { symbol: "XOM", label: "XOM", name: "ExxonMobil", city: "Houston", country: "United States", lat: 30.1, lng: -95.44, region: "americas", sector: "Energy", exchange: "NYC" },
  { symbol: "SHOP", label: "SHOP", name: "Shopify", city: "Ottawa", country: "Canada", lat: 45.42, lng: -75.69, region: "americas", sector: "Technology", exchange: "NYC" },
  { symbol: "MELI", label: "MELI", name: "MercadoLibre", city: "Montevideo", country: "Uruguay", lat: -34.9, lng: -56.16, region: "americas", sector: "Consumer", exchange: "NYC" },

  // ── Europe
  { symbol: "ASML.AS", label: "ASML", name: "ASML", city: "Veldhoven", country: "Netherlands", lat: 51.41, lng: 5.41, region: "europe", sector: "Technology", exchange: "EUR" },
  { symbol: "MC.PA", label: "MC", name: "LVMH", city: "Paris", country: "France", lat: 48.87, lng: 2.31, region: "europe", sector: "Consumer", exchange: "EUR" },
  { symbol: "SAP.DE", label: "SAP", name: "SAP", city: "Walldorf", country: "Germany", lat: 49.29, lng: 8.64, region: "europe", sector: "Technology", exchange: "EUR" },
  { symbol: "SIE.DE", label: "SIE", name: "Siemens", city: "Munich", country: "Germany", lat: 48.14, lng: 11.57, region: "europe", sector: "Industry", exchange: "EUR" },
  { symbol: "NOVO-B.CO", label: "NOVO B", name: "Novo Nordisk", city: "Bagsværd", country: "Denmark", lat: 55.76, lng: 12.45, region: "europe", sector: "Health", exchange: "EUR" },
  { symbol: "NESN.SW", label: "NESN", name: "Nestlé", city: "Vevey", country: "Switzerland", lat: 46.46, lng: 6.84, region: "europe", sector: "Consumer", exchange: "EUR" },
  { symbol: "ITX.MC", label: "ITX", name: "Inditex", city: "Arteixo", country: "Spain", lat: 43.3, lng: -8.51, region: "europe", sector: "Consumer", exchange: "EUR" },
  { symbol: "SAN.MC", label: "SAN", name: "Banco Santander", city: "Madrid", country: "Spain", lat: 40.39, lng: -3.87, region: "europe", sector: "Finance", exchange: "EUR" },
  { symbol: "RACE.MI", label: "RACE", name: "Ferrari", city: "Maranello", country: "Italy", lat: 44.53, lng: 10.86, region: "europe", sector: "Consumer", exchange: "EUR" },
  { symbol: "SHEL.L", label: "SHEL", name: "Shell", city: "London", country: "United Kingdom", lat: 51.5, lng: -0.12, region: "europe", sector: "Energy", exchange: "LON" },
  { symbol: "AZN.L", label: "AZN", name: "AstraZeneca", city: "Cambridge", country: "United Kingdom", lat: 52.17, lng: 0.14, region: "europe", sector: "Health", exchange: "LON" },
  { symbol: "SPOT", label: "SPOT", name: "Spotify", city: "Stockholm", country: "Sweden", lat: 59.33, lng: 18.07, region: "europe", sector: "Media", exchange: "NYC" },

  // ── Asia-Pacific & Middle East
  { symbol: "7203.T", label: "7203", name: "Toyota", city: "Toyota City", country: "Japan", lat: 35.08, lng: 137.16, region: "asia", sector: "Industry", exchange: "TYO" },
  { symbol: "6758.T", label: "6758", name: "Sony", city: "Tokyo", country: "Japan", lat: 35.63, lng: 139.74, region: "asia", sector: "Media", exchange: "TYO" },
  { symbol: "7974.T", label: "7974", name: "Nintendo", city: "Kyoto", country: "Japan", lat: 35.0, lng: 135.75, region: "asia", sector: "Media", exchange: "TYO" },
  { symbol: "005930.KS", label: "005930", name: "Samsung Electronics", city: "Suwon", country: "South Korea", lat: 37.26, lng: 127.03, region: "asia", sector: "Technology", exchange: "SEL" },
  { symbol: "TSM", label: "TSM", name: "TSMC", city: "Hsinchu", country: "Taiwan", lat: 24.77, lng: 121.0, region: "asia", sector: "Technology", exchange: "NYC" },
  { symbol: "0700.HK", label: "0700", name: "Tencent", city: "Shenzhen", country: "China", lat: 22.54, lng: 113.93, region: "asia", sector: "Technology", exchange: "HKG" },
  { symbol: "BABA", label: "BABA", name: "Alibaba", city: "Hangzhou", country: "China", lat: 30.27, lng: 120.15, region: "asia", sector: "Consumer", exchange: "NYC" },
  { symbol: "RELIANCE.NS", label: "RELIANCE", name: "Reliance Industries", city: "Mumbai", country: "India", lat: 19.08, lng: 72.88, region: "asia", sector: "Energy", exchange: "BOM" },
  { symbol: "2222.SR", label: "2222", name: "Saudi Aramco", city: "Dhahran", country: "Saudi Arabia", lat: 26.29, lng: 50.11, region: "asia", sector: "Energy", exchange: "RUH" },
  { symbol: "BHP.AX", label: "BHP", name: "BHP", city: "Melbourne", country: "Australia", lat: -37.81, lng: 144.96, region: "asia", sector: "Industry", exchange: "SYD" },
];

// Regular trading sessions in local exchange time (minutes from midnight).
// Public holidays are not modelled, hence "regular hours" in the UI.
interface ExchangeHours {
  name: string;
  timeZone: string;
  sessions: [number, number][];
  /** 0 = Sunday. Riyadh trades Sunday to Thursday. */
  days: number[];
}

const WEEKDAYS = [1, 2, 3, 4, 5];

export const EXCHANGES: Record<ExchangeId, ExchangeHours> = {
  NYC: { name: "New York", timeZone: "America/New_York", sessions: [[570, 960]], days: WEEKDAYS },
  LON: { name: "London", timeZone: "Europe/London", sessions: [[480, 990]], days: WEEKDAYS },
  EUR: { name: "Europe", timeZone: "Europe/Paris", sessions: [[540, 1050]], days: WEEKDAYS },
  TYO: { name: "Tokyo", timeZone: "Asia/Tokyo", sessions: [[540, 690], [750, 930]], days: WEEKDAYS },
  HKG: { name: "Hong Kong", timeZone: "Asia/Hong_Kong", sessions: [[570, 720], [780, 960]], days: WEEKDAYS },
  BOM: { name: "Mumbai", timeZone: "Asia/Kolkata", sessions: [[555, 930]], days: WEEKDAYS },
  SYD: { name: "Sydney", timeZone: "Australia/Sydney", sessions: [[600, 960]], days: WEEKDAYS },
  SEL: { name: "Seoul", timeZone: "Asia/Seoul", sessions: [[540, 930]], days: WEEKDAYS },
  RUH: { name: "Riyadh", timeZone: "Asia/Riyadh", sessions: [[600, 900]], days: [0, 1, 2, 3, 4] },
};

const DAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function isExchangeOpen(id: ExchangeId, now = new Date()): boolean {
  const exchange = EXCHANGES[id];
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: exchange.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = DAY_INDEX[get("weekday")];
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));

  return (
    exchange.days.includes(day) &&
    exchange.sessions.some(([open, close]) => minutes >= open && minutes < close)
  );
}

export function openExchanges(now = new Date()): ExchangeId[] {
  return (Object.keys(EXCHANGES) as ExchangeId[]).filter((id) => isExchangeOpen(id, now));
}
