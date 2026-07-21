import { useEffect, useRef, useState } from 'react';
import { getCachedAccessToken } from '../authentication/tokenCache';

const API_ORIGIN =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_ORIGIN
    ? import.meta.env.VITE_API_ORIGIN
    : 'http://0.0.0.0:8000/';

export interface RealtimePrice {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  dayVolume?: number;
  time?: number;
}

interface StreamMessage {
  type: 'price' | 'subscribed' | 'unsubscribed' | 'error';
  data?: {
    id?: string;
    price?: number;
    change?: number;
    changePercent?: number;
    dayVolume?: number | string;
    time?: number | string;
  };
}

const wsUrl = (tickers: string[], token: string): string => {
  const origin = API_ORIGIN.replace(/^http/, 'ws').replace(/\/$/, '');
  return `${origin}/api/v1/ws/prices?tickers=${encodeURIComponent(tickers.join(','))}&token=${encodeURIComponent(token)}`;
};

/**
 * Subscribe to real-time price updates over the market data API websocket
 * (/api/v1/ws/prices). Returns a map of ticker -> latest quote, updated live
 * while the US market streams trades. Reconnects when the ticker list changes.
 */
export const useRealtimePrices = (tickers: string[], enabled = true) => {
  const [prices, setPrices] = useState<Record<string, RealtimePrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  // Stable key so the effect only re-runs when the actual set of tickers changes
  const tickersKey = [...new Set(tickers.map(t => t.toUpperCase()))].sort().join(',');

  useEffect(() => {
    if (!enabled || !tickersKey) return;

    let cancelled = false;

    getCachedAccessToken().then(token => {
      if (cancelled || !token) return;

      const socket = new WebSocket(wsUrl(tickersKey.split(','), token));
      socketRef.current = socket;

      socket.onopen = () => setIsConnected(true);
      socket.onclose = () => setIsConnected(false);

      socket.onmessage = event => {
        try {
          const message: StreamMessage = JSON.parse(event.data);
          if (message.type !== 'price' || !message.data?.id || message.data.price == null) return;

          const symbol = message.data.id.toUpperCase();
          setPrices(prev => ({
            ...prev,
            [symbol]: {
              symbol,
              price: message.data!.price!,
              change: message.data!.change,
              changePercent: message.data!.changePercent,
              dayVolume: message.data!.dayVolume != null ? Number(message.data!.dayVolume) : undefined,
              time: message.data!.time != null ? Number(message.data!.time) : undefined,
            },
          }));
        } catch {
          // ignore malformed frames
        }
      };
    });

    return () => {
      cancelled = true;
      socketRef.current?.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [tickersKey, enabled]);

  return { prices, isConnected };
};
