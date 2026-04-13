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

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
};

const ConfirmDeleteDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Eintrag löschen?",
  description = "Diese Aktion kann nicht rückgängig gemacht werden.",
  confirmLabel = "Löschen bestätigen",
  cancelLabel = "Abbrechen",
  isLoading = false,
}: ConfirmDeleteDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        data-admin-dialog-theme="light"
        className="admin-dialog-scope w-[calc(100vw-2rem)] max-w-[460px] gap-5 rounded-[1.35rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.45)]"
      >
        <AlertDialogHeader className="space-y-2 text-left">
          <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-7 text-slate-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 border-t border-slate-100 pt-4 sm:justify-end sm:space-x-0">
          <AlertDialogCancel className="mt-0 rounded-xl border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="rounded-xl bg-red-600 text-white hover:bg-red-700 focus:ring-red-400"
            disabled={isLoading}
          >
            {isLoading ? "Lösche..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
