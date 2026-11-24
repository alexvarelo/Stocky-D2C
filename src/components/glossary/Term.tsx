import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getGlossaryEntry } from "@/content/glossary";
import { cn } from "@/lib/utils";

interface TermProps {
  id: string;
  children: ReactNode;
  className?: string;
}

const CLOSE_DELAY_MS = 120;

/** Only one glossary card is open at a time: opening one closes whichever was open. */
let closeActive: (() => void) | null = null;

/**
 * Wraps a metric label with a dotted underline and a glossary popover.
 * Desktop: opens on hover/focus. Touch: opens on tap. Keyboard: Enter/Space toggles, Esc closes.
 * Unknown ids render the children unchanged.
 */
export function Term({ id, children, className }: TermProps) {
  const entry = getGlossaryEntry(id);
  const [open, setOpenState] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeSelf = useRef(() => setOpenState(false));

  const setOpen = useCallback((next: boolean) => {
    if (next && closeActive !== closeSelf.current) {
      closeActive?.();
      closeActive = closeSelf.current;
    } else if (!next && closeActive === closeSelf.current) {
      closeActive = null;
    }
    setOpenState(next);
  }, []);

  useEffect(
    () => () => {
      if (closeActive === closeSelf.current) closeActive = null;
    },
    [],
  );
  const lastPointer = useRef<string>("mouse");
  const openedByFocus = useRef(false);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }, [cancelClose, setOpen]);

  useEffect(() => cancelClose, [cancelClose]);

  useEffect(() => {
    if (!entry && import.meta.env.DEV) {
      console.warn(`[Term] Unknown glossary id "${id}"`);
    }
  }, [entry, id]);

  if (!entry) return <>{children}</>;

  const hoverCapable = () => lastPointer.current === "mouse";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline cursor-help appearance-none border-0 bg-transparent p-0 text-inherit font-inherit",
            "underline decoration-dotted decoration-muted-foreground/60 underline-offset-4",
            "hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
            className,
          )}
          onPointerDown={(e) => {
            lastPointer.current = e.pointerType;
          }}
          onPointerEnter={(e) => {
            lastPointer.current = e.pointerType;
            if (e.pointerType === "mouse") {
              cancelClose();
              setOpen(true);
            }
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") scheduleClose();
          }}
          onFocus={(e) => {
            // Only keyboard focus opens the card; mouse/touch focus is handled by hover/tap.
            if (e.currentTarget.matches(":focus-visible")) {
              openedByFocus.current = true;
              setOpen(true);
            }
          }}
          onBlur={() => {
            openedByFocus.current = false;
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          onClick={(e) => {
            // Enter/Space (detail 0) right after focus-open keeps it open; a later Enter toggles.
            if (e.detail === 0 && openedByFocus.current) {
              e.preventDefault();
              openedByFocus.current = false;
              cancelClose();
              setOpen(true);
              return;
            }
            // Mouse users already opened it via hover; a click should keep it open, not toggle it shut.
            if (hoverCapable() && e.detail > 0) {
              e.preventDefault();
              cancelClose();
              setOpen(true);
            }
          }}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 space-y-2 text-sm"
        onPointerEnter={cancelClose}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") scheduleClose();
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div>
          <p className="font-semibold leading-tight">
            {entry.term}
            {entry.abbr && <span className="ml-1.5 text-xs font-normal text-muted-foreground">({entry.abbr})</span>}
          </p>
        </div>
        <p className="text-muted-foreground">{entry.short}</p>
        {entry.example && (
          <p>
            <span className="font-medium">Example: </span>
            <span className="text-muted-foreground">{entry.example}</span>
          </p>
        )}
        {entry.pitfall && (
          <p>
            <span className="font-medium">Watch out: </span>
            <span className="text-muted-foreground">{entry.pitfall}</span>
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default Term;
