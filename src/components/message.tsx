"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"
import { useState } from "react"

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

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split("\n")
      .map((line, index) => {
        if (line.startsWith("```")) {
          return null // Handle code blocks separately
        }
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-xl font-bold mt-4 mb-2 text-white">
              {line.slice(2)}
            </h1>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="text-lg font-bold mt-3 mb-2 text-white">
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith("- ")) {
          return (
            <li key={index} className="ml-4 text-white">
              {line.slice(2)}
            </li>
          )
        }
        if (line.trim() === "") {
          return <br key={index} />
        }
        return (
          <p key={index} className="mb-2 text-white">
            {line}
          </p>
        )
      })
      .filter(Boolean)
  }

  return (
    <div className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
      {message.role === "assistant" && (
        <Avatar className="w-8 h-8 bg-green-500">
          <AvatarFallback className="bg-green-500 text-white text-sm">AI</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex-1 max-w-3xl ${message.role === "user" ? "order-first" : ""}`}>
        <div
          className={`rounded-lg p-4 ${
            message.role === "user" ? "bg-blue-500 text-white ml-auto max-w-lg" : "text-white"
          }`}
          style={{
            backgroundColor: message.role === "assistant" ? "rgb(52,52,52)" : undefined,
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
            <div className="prose prose-sm max-w-none">{formatContent(message.content)}</div>
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

      {message.role === "user" && (
        <Avatar className="w-8 h-8 bg-blue-500">
          <AvatarFallback className="bg-blue-500 text-white text-sm">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
