import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "@/lib/dateFormat";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useCreateStockNote,
  useDeleteStockNote,
  useStockNotes,
  useUpdateStockNote,
  type StockNote,
} from "@/hooks/useStockNotes";
import { ThesisSection } from "@/components/thesis/ThesisSection";
import { getLocale } from "@/lib/locale";

const MDEditor = lazy(() => import("@uiw/react-md-editor"));
const MarkdownPreview = lazy(() =>
  import("@uiw/react-md-editor").then((m) => ({ default: m.default.Markdown })),
);

const NOTE_MAX_CHARS = 20000;

function NoteEditor({
  ticker,
  note,
  onDone,
}: {
  ticker: string;
  note?: StockNote;
  onDone: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState(note?.body ?? "");
  const create = useCreateStockNote(ticker);
  const update = useUpdateStockNote(ticker);
  const pending = create.isPending || update.isPending;

  const save = () => {
    const body = value.trim();
    if (!body) return;
    if (note) update.mutate({ id: note.id, body }, { onSuccess: onDone });
    else create.mutate(body, { onSuccess: onDone });
  };

  return (
    <div className="space-y-3" data-color-mode={resolvedTheme}>
      <Suspense fallback={<Skeleton className="h-60 w-full" />}>
        <MDEditor
          value={value}
          onChange={(v) => setValue((v ?? "").slice(0, NOTE_MAX_CHARS))}
          height={240}
          preview="edit"
          textareaProps={{ maxLength: NOTE_MAX_CHARS }}
        />
      </Suspense>
      <p
        className={
          value.length >= NOTE_MAX_CHARS * 0.9 ? "text-xs text-amber-600 dark:text-amber-400" : "text-xs text-muted-foreground"
        }
      >
        {value.length.toLocaleString(getLocale())} / {NOTE_MAX_CHARS.toLocaleString(getLocale())}
        {value.length >= NOTE_MAX_CHARS && " · limit reached"}
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={save} disabled={pending || !value.trim()}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save note
        </Button>
      </div>
    </div>
  );
}

export function StockNotes({ ticker }: { ticker: string }) {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const { data: notes, isLoading } = useStockNotes(ticker);
  const remove = useDeleteStockNote(ticker);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockNote | null>(null);

  if (!user) {
    return (
      <Card>
        <CardContent className="space-y-3 pt-6 text-sm">
          <p className="text-muted-foreground">Sign in to keep private notes and an investment thesis for {ticker}.</p>
          <Button asChild size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <ThesisSection ticker={ticker} />

      <section className="space-y-3" aria-label="Notes">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Notes</h3>
          {!creating && (
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New note
            </Button>
          )}
        </div>

        {creating && (
          <Card>
            <CardContent className="pt-6">
              <NoteEditor ticker={ticker} onDone={() => setCreating(false)} />
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : notes && notes.length > 0 ? (
          notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="space-y-3 pt-6">
                {editingId === note.id ? (
                  <NoteEditor ticker={ticker} note={note} onDone={() => setEditingId(null)} />
                ) : (
                  <>
                    <div data-color-mode={resolvedTheme}>
                      <Suspense fallback={<Skeleton className="h-12 w-full" />}>
                        <MarkdownPreview source={note.body} style={{ background: "transparent" }} />
                      </Suspense>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.created_at), "PP")}
                        {note.updated_at !== note.created_at && " · edited"}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" aria-label="Edit note" onClick={() => setEditingId(note.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete note" onClick={() => setDeleteTarget(note)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          !creating && (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                No notes yet. Jot down what you learn about {ticker}.
              </CardContent>
            </Card>
          )
        )}
      </section>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && remove.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
