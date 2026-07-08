"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function Btn({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`h-7 min-w-7 rounded px-2 text-sm ${
        ativo ? "bg-accent-tint text-accent-ink" : "text-muted hover:bg-surface-2"
      }`}
      aria-pressed={ativo}
    >
      {children}
    </button>
  );
}

export function RichText({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "conteudo-rico min-h-32 px-3 py-2 outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap gap-1 border-b border-border p-1.5">
        <Btn ativo={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>N</strong>
        </Btn>
        <Btn ativo={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </Btn>
        <Btn ativo={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          T
        </Btn>
        <Btn ativo={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          •
        </Btn>
        <Btn ativo={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
