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
  addMessage: (content: string, role: "user" | "assistant") => void
  getCurrentChat: () => Chat | null
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
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
    if (!currentChatId) return

    const newMessage = {
      id: Date.now().toString(),
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
  }

  const getCurrentChat = () => {
    return chats.find((chat) => chat.id === currentChatId) || null
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
