import { useEffect, useRef, type ChangeEvent, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

type ToolbarButtonProps = {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: ReactNode;
};

const ToolbarButton = ({ active = false, onClick, disabled = false, title, children }: ToolbarButtonProps) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    disabled={disabled}
    onClick={onClick}
    title={title}
    className={cn(
      "h-9 rounded-xl border-slate-200 bg-white px-3 text-slate-600 hover:border-[#FF4B2C]/30 hover:bg-[#FF4B2C]/5 hover:text-[#FF4B2C]",
      active && "border-[#FF4B2C]/30 bg-[#FF4B2C]/10 text-[#FF4B2C]",
    )}
  >
    {children}
  </Button>
);

const getSafeInitialContent = (value: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "<p></p>";
};

export const RichTextEditor = ({
  value,
  onChange,
  onImageUpload,
  disabled = false,
  placeholder = "Schreibe deinen redaktionellen Beitrag…",
  className,
}: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "font-semibold text-[#FF4B2C] underline underline-offset-4",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "my-6 w-full rounded-[24px] border border-slate-200 shadow-sm",
          loading: "lazy",
          decoding: "async",
        },
      }),
    ],
    content: getSafeInitialContent(value),
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[320px] px-5 py-4 text-slate-800 focus:outline-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-8 prose-a:text-[#FF4B2C] prose-img:rounded-[24px]",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const nextValue = getSafeInitialContent(value);
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, false);
    }
  }, [editor, value]);

  const handleSetLink = () => {
    if (!editor) return;

    const previousUrl = (editor.getAttributes("link").href as string | undefined) || "";
    const url = window.prompt("Link-URL eingeben", previousUrl);

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !editor) return;
    if (!onImageUpload) {
      toast.error("Für diesen Editor ist kein Bild-Upload hinterlegt.");
      return;
    }

    try {
      const imageUrl = await onImageUpload(file);
      if (!imageUrl) throw new Error("Keine Bild-URL erhalten.");

      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl,
          alt: file.name,
          title: file.name,
        })
        .run();

      toast.success("Bild in den Beitrag eingefügt.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload fehlgeschlagen.";
      toast.error(message);
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm", className)}>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <ToolbarButton title="Rückgängig" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Wiederholen" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-9 w-px bg-slate-200" />

        <ToolbarButton title="Fett" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Kursiv" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Überschrift H2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Überschrift H3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Liste" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Nummerierte Liste" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Zitat" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Link setzen" active={editor?.isActive("link")} onClick={handleSetLink}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Bild hochladen" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <EditorContent editor={editor} className="min-h-[320px] bg-white" />
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
        Erlaubte Uploads: JPG, PNG, WEBP bis 2 MB. Bilder werden über Supabase Storage gespeichert und per Render-API ausgeliefert.
      </div>
    </div>
  );
};

export default RichTextEditor;
