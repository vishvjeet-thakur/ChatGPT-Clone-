import React, { useEffect, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { X, Save, Copy, Check } from "lucide-react";

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  onSave: (code: string) => void;
  language: string;
  onSidebarToggle?: () => void;
}

const languageMap: { [key: string]: string } = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  html: "html",
  css: "css",
  json: "json",
  markdown: "markdown",
  bash: "shell",
  shell: "shell",
  sql: "sql",
  java: "java",
  cpp: "cpp",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  php: "php",
  ruby: "ruby",
  swift: "swift",
  kotlin: "kotlin",
  scala: "scala",
  r: "r",
  matlab: "matlab",
  fortran: "fortran",
  perl: "perl",
  lua: "lua",
  julia: "julia",
  dart: "dart",
  elixir: "elixir",
  clojure: "clojure",
  haskell: "haskell",
  ocaml: "ocaml",
  fsharp: "fsharp",
  groovy: "groovy",
  powershell: "powershell",
  yaml: "yaml",
  xml: "xml",
  toml: "toml",
  ini: "ini",
  diff: "diff",
  dockerfile: "dockerfile",
  makefile: "makefile",
  plaintext: "plaintext",
};

export function CodeEditor({
  isOpen,
  onClose,
  initialCode,
  onSave,
  language,
  onSidebarToggle,
}: CodeEditorProps) {
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && onSidebarToggle) {
      onSidebarToggle();
    }
  }, [isOpen, onSidebarToggle]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleSave = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      onSave(code);
      onClose();
    }
  };

  const handleCopy = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!isOpen) return null;

  const mappedLanguage = languageMap[language.toLowerCase()] || "plaintext";

  return (
    <div className="fixed top-0 right-0 z-50 w-1/2 h-screen bg-[#171616] border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-200">
            {language.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleSave}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Save changes"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Close editor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="h-[calc(100%-40px)]">
        <Editor
          height="100%"
          defaultLanguage={mappedLanguage}
          defaultValue={initialCode}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
} 