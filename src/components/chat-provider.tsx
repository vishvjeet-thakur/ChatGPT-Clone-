"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Chat {
  id: string
  title: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
  }>
}

interface ChatContextType {
  chats: Chat[]
  currentChatId: string | null
  createNewChat: () => void
  selectChat: (id: string) => void
  deleteChat: (id: string) => void
  addMessage: (content: string, role: "user" | "assistant") => string
  getCurrentChat: () => Chat | null
  setMessage: (messageId: string, content: string) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  const generateUniqueId = () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${timestamp}-${random}`
  }

  const createNewChat = () => {
    const newChat: Chat = {
      id: generateUniqueId(),
      title: "New chat",
      messages: [],
    }
    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChat.id)
  }

  const selectChat = (id: string) => {
    setCurrentChatId(id)
  }

  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id))
    if (currentChatId === id) {
      setCurrentChatId(null)
    }

  }

  const addMessage = (content: string, role: "user" | "assistant") => {
    if (!currentChatId) return ""

    const messageId = generateUniqueId()
    const newMessage = {
      id: messageId,
      role,
      content,
      timestamp: new Date(),
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, newMessage],
          }

          // Update title based on first user message
          if (chat.messages.length === 0 && role === "user") {
            updatedChat.title = content.slice(0, 30) + (content.length > 30 ? "..." : "")
          }

          return updatedChat
        }
        return chat
      }),
    )

    return messageId
  }

  const getCurrentChat = () => {
    return chats.find((chat) => chat.id === currentChatId) || null
  }

  const setMessage = (messageId: string, content: string) => {
    setChats((prev) =>
      prev.map((chat) => ({
        ...chat,
        messages: chat.messages.map((msg) =>
          msg.id === messageId ? { ...msg, content } : msg
        ),
      }))
    )
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        createNewChat,
        selectChat,
        deleteChat,
        addMessage,
        getCurrentChat,
        setMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within ChatProvider")
  }
  return context
}
