"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["clean"],
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: TOOLBAR_OPTIONS,
    }),
    [],
  );

  return (
    <div className={`rich-text-editor ${className || ""}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || "พิมพ์ข้อความ..."}
      />
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-color: var(--md-outline-variant) !important;
          border-radius: var(--md-radius-sm) var(--md-radius-sm) 0 0;
          background: var(--md-surface-container);
        }
        .rich-text-editor .ql-container {
          border-color: var(--md-outline-variant) !important;
          border-radius: 0 0 var(--md-radius-sm) var(--md-radius-sm);
          font-size: 13px;
          min-height: 120px;
        }
        .rich-text-editor .ql-editor {
          min-height: 120px;
          color: var(--md-on-surface);
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: var(--md-on-surface-variant);
          font-style: normal;
        }
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: var(--md-primary) !important;
        }
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: var(--md-primary) !important;
        }
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: var(--md-primary) !important;
        }
      `}</style>
    </div>
  );
}
