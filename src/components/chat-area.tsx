"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/components/chat-provider"
import { Send, Square, PanelLeft } from "lucide-react"
import { Message } from "@/components/message"

interface ChatAreaProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function ChatArea({ sidebarOpen, onToggleSidebar }: ChatAreaProps) {
  const { getCurrentChat, addMessage, createNewChat, currentChatId } = useChat()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const currentChat = getCurrentChat()

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [currentChat?.messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Create new chat if none exists
    if (!currentChatId) {
      createNewChat()
      // Wait a bit for the chat to be created
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Add user message
    addMessage(userMessage, "user")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...(getCurrentChat()?.messages || []), { role: "user", content: userMessage }],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            assistantMessage += chunk
          }
        } catch (streamError) {
          console.error("Stream reading error:", streamError)
        }
      }

      // Add the complete assistant message
      addMessage(assistantMessage || "I apologize, but I encountered an error processing your request.", "assistant")
    } catch (error) {
      console.error("Chat error:", error)
      addMessage("I apologize, but I encountered an error processing your request. Please try again.", "assistant")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white" style={{ backgroundColor: "rgb(32,32,33)" }}>
      {/* Header */}
      <div
        className="border-b border-gray-600 p-4 flex items-center gap-3"
        style={{ backgroundColor: "rgb(32,32,33)", borderColor: "rgb(64,64,64)" }}
      >
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-700 text-gray-300 hover:text-white"
          >
            <PanelLeft size={20} />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-white">ChatGPT</h1>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        {currentChat?.messages.length === 0 || !currentChat ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-semibold text-white mb-4">How can I help you today?</h2>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "Explain quantum computing in simple terms",
                  "Write a creative story about a time traveler",
                  "Help me plan a healthy meal for the week",
                  "Create a Python script to analyze data",
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left h-auto p-3 whitespace-normal hover:bg-gray-700 border-gray-600 text-white bg-transparent"
                    onClick={() => setInput(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {currentChat.messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && (
              <Message
                message={{
                  id: "loading",
                  role: "assistant",
                  content: "",
                  timestamp: new Date(),
                }}
                isLoading={true}
              />
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4" style={{ backgroundColor: "rgb(49,48,49)", borderColor: "rgb(64,64,64)" }}>
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ChatGPT..."
            className="min-h-[60px] max-h-[200px] pr-12 resize-none border-gray-600 focus:border-gray-500 focus:ring-gray-500 bg-gray-800 text-white placeholder:text-gray-400"
            style={{ backgroundColor: "rgb(64,64,64)", borderColor: "rgb(96,96,96)" }}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900"
          >
            {isLoading ? <Square size={16} /> : <Send size={16} />}
          </Button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">ChatGPT can make mistakes. Check important info.</p>
      </div>
    </div>
  )
}
