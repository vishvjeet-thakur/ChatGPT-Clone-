"use client"

import { Button } from "@/components/ui/button"
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"
import type { Components } from "react-markdown"
import "highlight.js/styles/github-dark.css"

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

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const components: Components = {
    pre: ({ node, ...props }) => (
      <div className="relative">
        <pre
          className="mt-2 mb-4 overflow-x-auto rounded-lg bg-black p-4 whitespace-pre-wrap"
          {...props}
        />
      </div>
    ),
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "")
      const isInline = !match
      return isInline ? (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code
          className={className}
          {...props}
        >
          {children}
        </code>
      )
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
    </div>
  )
}
