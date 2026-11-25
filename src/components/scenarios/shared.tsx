import { useState, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ScenarioExcluded } from "@/api/financialDataApi.schemas";
import { EXCLUSION_REASON } from "./format";

export function ErrorBox({ message, onRetry, retrying }: { message: string; onRetry?: () => void; retrying?: boolean }) {
  return (
    <div role="alert" className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" aria-hidden />
        <p className="text-sm break-words">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying} className="gap-2 self-start sm:self-auto">
          <RefreshCw className={`h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`} aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}

export function ChangedHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="text-xs text-muted-foreground" role="status">
      Inputs changed — run again to update.
    </p>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

export function ExcludedNote({ excluded }: { excluded?: ScenarioExcluded[] }) {
  if (!excluded?.length) return null;
  return (
    <p className="text-xs text-muted-foreground">
      Left out of this analysis:{" "}
      {excluded.map((e) => `${e.ticker} (${EXCLUSION_REASON[e.reason] ?? e.reason})`).join(", ")}.
    </p>
  );
}

export function Stat({ label, value, sub, className }: { label: ReactNode; value: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-3 sm:p-4 flex flex-col gap-1 min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg sm:text-xl font-semibold tabular-nums break-words ${className ?? ""}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  title: string;
  defaultName?: string;
  saving?: boolean;
  onSave: (_name: string) => void;
}

/** Asks for a name (1-120 chars) before saving. */
export function SaveNameDialog({ open, onOpenChange, title, defaultName = "", saving, onSave }: SaveDialogProps) {
  const [name, setName] = useState(defaultName);
  const trimmed = name.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= 120;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setName(defaultName);
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-3xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onSave(trimmed);
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>Give it a name so you can find it later. Only the settings and headline numbers are stored.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="save-name">Name</Label>
            <Input id="save-name" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || saving} className="gap-2">
              <Save className="h-4 w-4" aria-hidden />
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Button + name dialog; closes after the save call resolves. */
export function SaveButton({
  label,
  title,
  defaultName,
  saving,
  onSave,
}: {
  label: string;
  title: string;
  defaultName?: string;
  saving?: boolean;
  onSave: (_name: string) => Promise<unknown> | void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Save className="h-4 w-4" aria-hidden />
        {label}
      </Button>
      <SaveNameDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        defaultName={defaultName}
        saving={saving}
        onSave={async (name) => {
          try {
            await onSave(name);
            setOpen(false);
          } catch {
            /* the mutation hook already toasts the error; keep the dialog open */
          }
        }}
      />
    </>
  );
}

/** Trash icon button that asks for confirmation before calling onConfirm. */
export function ConfirmDeleteButton({ name, disabled, onConfirm }: { name: string; disabled?: boolean; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label={`Delete ${name}`} disabled={disabled}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{name}"?</AlertDialogTitle>
          <AlertDialogDescription>This removes the saved settings and headline numbers. It cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
