"use client"

import { createContext, useContext, useRef, useState, type ReactNode } from "react"

interface Chat {
  id: string
  title: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    uploads: { url: string, mimeType: string, uuid: string }[]
    timestamp: Date
    messageType?: "code" | "chat"
  }>
}

interface CodeInterface{
  code: string
  language :string
}

interface ChatContextType {
  chats: Chat[]
  currentChatId: string | null
  isEditorOpen: boolean | null
  editingCode:  CodeInterface | null
  isRecording: boolean 
  uploadedFiles: { url: string, mimeType: string, uuid: string }[]
  setUploadedFiles: (file:{ url: string, mimeType: string, uuid: string }[]) => void
  setIsRecording: (val: boolean) => void
  setEditingCode: (code: CodeInterface | null) => void
  setIsEditorOpen: (val: boolean) => void
  createNewChat: () => void
  selectChat: (id: string) => void
  deleteChat: (id: string) => void
  addMessage: (content: string, role: "user" | "assistant",uploads?:{ url: string, mimeType: string, uuid: string }[], messageType?: "code" | "chat") => string
  getCurrentChat: () => Chat | null
  setMessage: (messageId: string, content: string) => void
  updateChatTitle: (chatId: string, title: string) => void
  waveformRef: React.RefObject<HTMLDivElement|null>;
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isEditorOpen , setIsEditorOpen] = useState<boolean | null >(false)
  const [editingCode, setEditingCodeState] = useState< CodeInterface | null>(null)
  const [isRecording, setIsRecording] = useState(false);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string, mimeType: string, uuid: string }[]>([]);

  const setEditingCode = (code:CodeInterface | null) => {
    setEditingCodeState(code);
  }


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

  const updateChatTitle = (chatId: string, title: string) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      )
    )
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

  const addMessage = (content: string, role: "user" | "assistant",  uploads: { url: string, mimeType: string, uuid: string }[]=[] , messageType: "code" | "chat" = "chat") => {
    if (!currentChatId) return ""

    const messageId = generateUniqueId()
    const newMessage = {
      id: messageId,
      role,
      content,
      uploads,
      timestamp: new Date(),
      messageType
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
        isEditorOpen,
        editingCode,
        isRecording,
        waveformRef,
        uploadedFiles,
        setUploadedFiles,
        setIsRecording,
        setEditingCode,
        setIsEditorOpen,
        createNewChat,
        selectChat,
        deleteChat,
        addMessage,
        getCurrentChat,
        setMessage,
        updateChatTitle,
        
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
