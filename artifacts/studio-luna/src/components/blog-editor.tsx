import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Image as ImageIcon,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading2, Heading3,
  Quote, Minus, Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function ToolbarBtn({ active, onClick, title, children }: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-foreground/50 hover:text-foreground hover:bg-secondary"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border/40 mx-0.5" />;
}

export function BlogEditor({ value, onChange }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Schrijf hier je artikel... Gebruik de knopjes hierboven om tekst op te maken, foto's toe te voegen of links te plaatsen." }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[320px] text-[14.5px] leading-[1.85] text-foreground/80",
      },
    },
  });

  // Sync external value changes (e.g. when loading an existing post)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const openLinkDialog = () => {
    const prev = editor.getAttributes("link").href || "";
    setLinkUrl(prev);
    setLinkOpen(true);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
    }
    setLinkOpen(false);
    setLinkUrl("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const original = ev.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const MAX = 900;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const src = canvas.toDataURL("image/jpeg", 0.80);
        editor.chain().focus().setImage({ src }).run();
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-background overflow-hidden">
      {/* ── TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border/30 bg-secondary/40">

        {/* Koppen */}
        <ToolbarBtn
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Koptekst 1"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Koptekst 2"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Opmaak */}
        <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Vet">
          <Bold className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursief">
          <Italic className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Onderstrepen">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Lijsten */}
        <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Opsomming">
          <List className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Genummerde lijst">
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citaat">
          <Quote className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Uitlijning */}
        <ToolbarBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Links uitlijnen">
          <AlignLeft className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Centreren">
          <AlignCenter className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Rechts uitlijnen">
          <AlignRight className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <ToolbarBtn active={editor.isActive("link")} onClick={openLinkDialog} title="Hyperlink toevoegen">
          <LinkIcon className="w-4 h-4" />
        </ToolbarBtn>
        {editor.isActive("link") && (
          <ToolbarBtn active={false} onClick={() => editor.chain().focus().unsetLink().run()} title="Link verwijderen">
            <Unlink className="w-4 h-4" />
          </ToolbarBtn>
        )}

        {/* Afbeelding */}
        <ToolbarBtn active={false} onClick={() => fileInputRef.current?.click()} title="Foto invoegen">
          <ImageIcon className="w-4 h-4" />
        </ToolbarBtn>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        <Divider />

        {/* Scheidingslijn */}
        <ToolbarBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Scheidingslijn">
          <Minus className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      {/* ── LINK DIALOG ── */}
      {linkOpen && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-border/30">
          <LinkIcon className="w-3.5 h-3.5 text-primary/60 shrink-0" />
          <input
            autoFocus
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setLinkOpen(false); }}
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-foreground/55"
          />
          <button type="button" onClick={applyLink} className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors px-2">
            Toepassen
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className="text-xs text-foreground/40 hover:text-foreground transition-colors">
            Annuleren
          </button>
        </div>
      )}

      {/* ── EDITOR CONTENT ── */}
      <div className="px-4 py-4 blog-editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
