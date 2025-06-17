"use client"

import React, { createContext, useContext, useRef, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@clerk/nextjs"
import { v4 as uuidv4 } from "uuid"
import { Chat, Message } from "@/types/chat"

interface CodeInterface {
  code: string
  language: string
}

interface ChatContextType {
  chats: Chat[]
  currentChatId: string | null
  isEditorOpen: boolean | null
  editingCode: CodeInterface | null
  isRecording: boolean
  isLoading: boolean
  uploadedFiles: { url: string, mimeType: string, uuid: string }[]
  setUploadedFiles: (file: { url: string, mimeType: string, uuid: string }[]) => void
  setIsRecording: (val: boolean) => void
  setEditingCode: (code: CodeInterface | null) => void
  setIsEditorOpen: (val: boolean) => void
  createNewChat: () => void
  selectChat: (id: string) => void
  deleteChat: (id: string) => void
  addMessage: (content: string, role: "user" | "assistant", uploads?: { url: string, mimeType: string, uuid: string }[], messageType?: "code" | "chat") => string
  getCurrentChat: () => Chat | null
  setMessage: (messageId: string, content: string) => void
  updateChatTitle: (chatId: string, title: string) => void
  waveformRef: React.RefObject<HTMLDivElement | null>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { userId, isSignedIn } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false)
  const [editingCode, setEditingCode] = useState<CodeInterface | null>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string, mimeType: string, uuid: string }[]>([])
  const waveformRef = useRef<HTMLDivElement | null>(null)

  // Load chats from database when user signs in
  useEffect(() => {
    if (isSignedIn && userId) {
      setIsLoading(true)
      fetch('/api/chats')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setChats(data)
            if (data.length > 0) {
              setCurrentChatId(data[0]._id)
            } else {
              // Only create a new chat if there are no existing chats
              createNewChat()
            }
          }
        })
        .catch(error => {
          console.error('Error loading chats:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [isSignedIn, userId])

  // Save chats to database when they change
  useEffect(() => {
    if (isSignedIn && userId && chats.length > 0) {
      const currentChat = chats.find(chat => chat._id === currentChatId)
      if (currentChat) {
        fetch('/api/chats', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: currentChat._id,
            title: currentChat.title,
            messages: currentChat.messages
          })
        }).catch(error => {
          console.error('Error saving chat:', error)
        })
      }
    }
  }, [chats, currentChatId, isSignedIn, userId])

  const createNewChat = () => {
    // Don't create a new chat if we already have an empty one
    const emptyChat = chats.find(chat => chat.messages.length === 0)
    if (emptyChat) {
      setCurrentChatId(emptyChat._id)
      return
    }

    const newChat: Omit<Chat, '_id' | 'userId'> = {
      title: "New Chat",
      messages: [],
    }

    setChats((prev) => [newChat as Chat, ...prev])
    setCurrentChatId(null)

    if (isSignedIn && userId) {
      fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newChat.title,
          messages: newChat.messages
        })
      })
      .then(res => res.json())
      .then(savedChat => {
        setChats(prev => prev.map(chat => 
          chat === newChat ? savedChat : chat
        ));
        setCurrentChatId(savedChat._id);
      })
      .catch(error => {
        console.error('Error creating chat:', error)
      })
    }
  }

  const selectChat = (id: string) => {
    setCurrentChatId(id)
  }

  const deleteChat = (id: string) => {
    setChats((prev) => {
      const newChats = prev.filter((chat) => chat._id !== id)
      // If we're deleting the current chat, select the first chat in the list
      if (currentChatId === id && newChats.length > 0) {
        setCurrentChatId(newChats[0]._id)
      } else if (currentChatId === id) {
        setCurrentChatId(null)
      }
      return newChats
    })

    if (isSignedIn && userId) {
      fetch('/api/chats', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId: id })
      }).catch(error => {
        console.error('Error deleting chat:', error)
      })
    }
  }

  const addMessage = (content: string, role: "user" | "assistant", uploads: { url: string, mimeType: string, uuid: string }[] = [], messageType: "code" | "chat" = "chat") => {
    if (!currentChatId) return ""

    const messageId = uuidv4()
    const newMessage: Message = {
      id: messageId,
      role,
      content,
      uploads,
      timestamp: new Date(),
      messageType
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat._id === currentChatId) {
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
    return chats.find((chat) => chat._id === currentChatId) || null
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

  const updateChatTitle = (chatId: string, title: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === chatId ? { ...chat, title } : chat
      )
    );

    if (isSignedIn && userId) {
      fetch('/api/chats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          title,
          messages: chats.find(chat => chat._id === chatId)?.messages || []
        })
      }).catch(error => {
        console.error('Error updating chat title:', error)
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        isEditorOpen,
        editingCode,
        isRecording,
        isLoading,
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
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
