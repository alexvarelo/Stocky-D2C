import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  children,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation('portfolio');
  title ??= t('delete.title');
  description ??= t('delete.description');
  confirmText ??= t('common:actions.delete');
  cancelText ??= t('common:actions.cancel');
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription className="pt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children && <div className="py-4">{children}</div>}
        <DialogFooter className="sm:justify-start pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mt-2 sm:mt-0"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="mt-2 sm:mt-0"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
