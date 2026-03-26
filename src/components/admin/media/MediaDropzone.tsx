import { useCallback, useMemo, useState } from "react";
import { ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MediaDropzoneProps = {
  value?: string | null;
  previewUrl?: string | null;
  title?: string;
  description?: string;
  accept?: Record<string, string[]>;
  disabled?: boolean;
  uploading?: boolean;
  onFileSelected: (file: File) => Promise<void> | void;
  onRemove?: () => void;
};

const MediaDropzone = ({
  value,
  previewUrl,
  title = "Datei hochladen",
  description = "Bild per Drag & Drop oder Klick auswählen.",
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".svg"] },
  disabled,
  uploading,
  onFileSelected,
  onRemove,
}: MediaDropzoneProps) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });

      await onFileSelected(file);
    },
    [onFileSelected],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDrop,
    accept,
    multiple: false,
    noClick: true,
    disabled: disabled || uploading,
  });

  const activePreview = useMemo(() => localPreview || previewUrl || null, [localPreview, previewUrl]);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "rounded-[1.5rem] border border-dashed p-5 transition",
          isDragActive
            ? "border-[#FF4B2C] bg-[#FFF4F1]"
            : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white",
          disabled || uploading ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              {uploading ? <Loader2 size={20} className="animate-spin text-[#FF4B2C]" /> : <UploadCloud size={20} className="text-[#FF4B2C]" />}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{title}</div>
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
              {value ? <p className="mt-2 text-xs font-medium text-slate-500">Pfad: {value}</p> : null}
            </div>
          </div>
          <Button type="button" variant="outline" className="rounded-xl border-slate-200" onClick={open} disabled={disabled || uploading}>
            <ImagePlus size={16} className="mr-2" />
            Datei wählen
          </Button>
        </div>
      </div>

      {activePreview ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Vorschau</div>
              <div className="mt-1 text-sm font-medium text-slate-700">Lokale/gespeicherte Bildvorschau</div>
            </div>
            {onRemove ? (
              <Button type="button" variant="ghost" className="rounded-xl text-slate-500 hover:text-red-600" onClick={onRemove}>
                <X size={16} className="mr-2" /> Entfernen
              </Button>
            ) : null}
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-100 bg-slate-50">
            <img src={activePreview} alt="Upload Preview" className="h-56 w-full object-cover" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MediaDropzone;
