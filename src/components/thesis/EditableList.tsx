import { useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditableListProps {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (_items: string[]) => void;
  maxItems?: number;
}

export function EditableList({ label, placeholder, items, onChange, maxItems }: EditableListProps) {
  const update = (i: number, value: string) => onChange(items.map((it, idx) => (idx === i ? value : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const listRef = useRef<HTMLDivElement>(null);
  const focusLast = useRef(false);

  // Focus the row just added with the Add button.
  useEffect(() => {
    if (!focusLast.current) return;
    focusLast.current = false;
    const inputs = listRef.current?.querySelectorAll("input");
    inputs?.[inputs.length - 1]?.focus();
  }, [items.length]);

  return (
    <div className="space-y-2" ref={listRef}>
      <Label>{label}</Label>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item}
            placeholder={placeholder}
            aria-label={`${label} ${i + 1}`}
            maxLength={500}
            onChange={(e) => update(i, e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
            onClick={() => remove(i)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={maxItems !== undefined && items.length >= maxItems}
          onClick={() => {
            focusLast.current = true;
            onChange([...items, ""]);
          }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
        {maxItems !== undefined && items.length >= maxItems && (
          <span className="text-xs text-muted-foreground">Maximum of {maxItems} items reached</span>
        )}
      </div>
    </div>
  );
}
