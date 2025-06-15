"use client"

import { Button } from "@/components/ui/button"
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Edit, Check } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"
import type { Components  } from "react-markdown"
import "highlight.js/styles/github-dark.css"
import React from "react"
import { CodeEditor } from "@/components/code-editor"
import { useChat } from "@/components/chat-provider"

interface MessageProps {
  message: {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
  }
  isLoading?: boolean
}

export function Message({ message, isLoading }: MessageProps) {
  const [copied, setCopied] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<{ code: string; language: string } | null>(null)
  const { setMessage } = useChat()

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveCode = (newCode: string) => {
    if (editingCode) {
      // Replace the code block in the message content
      const codeBlockRegex = new RegExp(`\`\`\`${editingCode.language}\\n[\\s\\S]*?\`\`\``)
      const newContent = message.content.replace(codeBlockRegex, `\`\`\`${editingCode.language}\n${newCode}\`\`\``)
      setMessage(message.id, newContent)
    }
  }

  const components: Components = {
    pre({ node, className, children, ...props }) {
      const codeElement = React.isValidElement(children) ? children : null;
      const LangclassName = (codeElement?.props as { className?: string })?.className || "";
      const [copied, setCopied] = useState(false);
      
      const match = /language-(\w+)/.exec(LangclassName || "");

      const getTextContent = (element: React.ReactElement | null): string => {
        if (!element) return '';
        const props = element.props as { children?: any };
        if (typeof props.children === 'string') return props.children;
        if (Array.isArray(props.children)) {
          return props.children
            .map((child: any) => {
              if (typeof child === 'string') return child;
              if (React.isValidElement(child)) return getTextContent(child);
              return '';
            })
            .join('');
        }
        return '';
      };

      const handleCopy = () => {
        const textContent = getTextContent(codeElement);
        navigator.clipboard.writeText(textContent).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(console.error);
      };

      const handleEdit = () => {
        const code = getTextContent(codeElement);
        const language = match ? match[1] : "text";
        setEditingCode({ code, language });
        setIsEditorOpen(true);
      };

      return (
        <div className="relative my-6 rounded-xl overflow-hidden !bg-[#171616]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 text-xs">
            <span className="text-gray-100 text-xs tracking-wider">
              {match ? match[1] : "text"}
            </span>
            <div className="flex">
              <button
                onClick={handleCopy}
                className="flex text-gray-100 hover:text-white px-1 py-1 transition text-xs"
              >
                {copied ? <Check className="h-[13px]" /> : <Copy className="h-[13px]" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button 
                onClick={handleEdit}
                className="flex py-1 px-1 text-xs text-gray-100 hover:text-white transition"
              >
                <Edit className="h-[13px]" />
                Edit
              </button>
            </div>
          </div>

          {/* Code Block */}
          <pre className="overflow-x-auto text-sm text-white m-0 p-0">
            <code className={`${className} block ${!match ? "px-4 py-2" : ""}`} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
  
    // For inline code
    code({ node, className, children, ...props }) {
      // If inside a <pre>, let `pre` handle the styling
      const isInline = !node?.position?.start || node.position.start.line === node.position.end.line;
  
      if (isInline) {
        return (
          // <pre className="inline">
          <code
            className="rounded bg-[#424242] px-1 py-0.5 font-normal  text-sm text-white"
            {...props}
          >
            {children}
          </code>
        );
      }
  
      // fallback for any edge cases (rare)
      return (
        <code className={`${className} !bg-[#171616]`} {...props}>
          {children}
        </code>
      );
    },
    p: ({ node, ...props }) => (
      <p className="whitespace-pre-wrap my-2" {...props} />
    ),
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-bold mt-7 mb-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-bold mt-6 mb-3" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg font-bold mt-5 mb-2" {...props} />
    ),
    h5: ({ node, ...props }) => (
      <h5 className="text-base font-bold mt-4 mb-2" {...props} />
    ),
    h6: ({ node, ...props }) => (
      <h6 className="text-sm font-bold mt-3 mb-2" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc pl-6 my-4" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-6 my-4" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-muted pl-4 italic my-4"
        {...props}
      />
    ),
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table className="border-collapse border border-muted" {...props} />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th className="border border-muted px-4 py-2 bg-muted" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="border border-muted px-4 py-2" {...props} />
    ),
  }

  return (
    <div className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
      <div className={`flex-1 max-w-3xl ${message.role === "user" ? "order-first" : ""}`}>
        <div
          className={`${
            message.role === "user" ? "text-white ml-auto max-w-lg rounded-3xl p-2 pl-5" : "text-white p-2"
          }`}
          style={{
            backgroundColor: message.role === "assistant" ? "rgb(32,32,33)" : "rgb(49,48,49)",
          }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[[remarkGfm, { breaks: true }]]}
                rehypePlugins={[
                  rehypeRaw,
                  rehypeSanitize,
                  [rehypeHighlight, { ignoreMissing: true }],
                ]}
                components={components}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {message.role === "assistant" && !isLoading && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            >
              <Copy size={14} />
              {copied ? "Copied!" : ""}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700">
              <ThumbsUp size={14} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700">
              <ThumbsDown size={14} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700">
              <RotateCcw size={14} />
            </Button>
          </div>
        )}
      </div>

      {isEditorOpen && editingCode && (
        <CodeEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingCode(null);
          }}
          initialCode={editingCode.code}
          onSave={() => {}}
          language={editingCode.language}
        />
      )}
    </div>
  )
}
