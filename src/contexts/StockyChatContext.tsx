import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface ChatDraft {
  text: string;
  /** Changes on every request so asking the same question twice still refills the input. */
  nonce: number;
}

interface StockyChatContextValue {
  open: boolean;
  setOpen: (_open: boolean) => void;
  draft: ChatDraft | null;
  /** Opens the chat and prefills the input. It never sends the message. */
  openWithDraft: (_text: string) => void;
}

const StockyChatContext = createContext<StockyChatContextValue | null>(null);

export function StockyChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ChatDraft | null>(null);

  const openWithDraft = useCallback((text: string) => {
    setDraft((prev) => ({ text, nonce: (prev?.nonce ?? 0) + 1 }));
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ open, setOpen, draft, openWithDraft }), [open, draft, openWithDraft]);
  return <StockyChatContext.Provider value={value}>{children}</StockyChatContext.Provider>;
}

/** Returns null outside the provider, so callers can hide chat-dependent UI. */
// eslint-disable-next-line react-refresh/only-export-components
export function useStockyChat() {
  return useContext(StockyChatContext);
}
