"use client"

import React, { createContext, useContext, useRef, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@clerk/nextjs"
import { v4 as uuidv4 } from "uuid"
import { Chat, Message } from "@/types/chat"
import { saveChatsToLocalStorage, loadChatsFromLocalStorage, clearLocalChats } from "@/lib/utils"

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

  // Load chats from database when user signs in, or from local storage when not signed in
  useEffect(() => {
    if (isSignedIn && userId) {
      setIsLoading(true)
      fetch('/api/chats')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            console.log('Loaded chats from database:', data)
            // Ensure all chats have a local id field
            const chatsWithIds = data.map(chat => ({
              ...chat,
              id: chat.id || chat._id // Use local id if available, otherwise use _id as fallback
            }))
            console.log('Chats with IDs:', chatsWithIds)
            setChats(chatsWithIds)
            if (chatsWithIds.length > 0) {
              setCurrentChatId(chatsWithIds[0].id)
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
      // Load from local storage when not signed in
      const localChats = loadChatsFromLocalStorage()
      console.log('Loaded chats from local storage:', localChats)
      setChats(localChats)
      if (localChats.length > 0) {
        setCurrentChatId(localChats[0].id)
      } else {
        createNewChat()
      }
      setIsLoading(false)
    }
  }, [isSignedIn, userId])

  // Save chats to local storage when not signed in, or to database when signed in
  useEffect(() => {
    if (isSignedIn && userId && chats.length > 0) {
      const currentChat = chats.find(chat => chat.id === currentChatId)
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
    } else if (!isSignedIn) {
      // Save to local storage when not signed in
      saveChatsToLocalStorage(chats)
    }
  }, [chats, currentChatId, isSignedIn, userId])

  // Clear local storage when user signs in (to avoid conflicts)
  useEffect(() => {
    if (isSignedIn) {
      clearLocalChats()
    }
  }, [isSignedIn])

  const createNewChat = () => {
    // Don't create a new chat if we already have an empty one
    const emptyChat = chats.find(chat => chat.messages.length === 0)
    if (emptyChat) {
      setCurrentChatId(emptyChat.id)
      return
    }

    const newChat: Omit<Chat, '_id' | 'userId'> = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
    }

    setChats((prev) => [newChat as Chat, ...prev])
    setCurrentChatId(newChat.id)

    if (isSignedIn && userId) {
      fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newChat.id,
          title: newChat.title,
          messages: newChat.messages
        })
      })
      .then(res => res.json())
      .then(savedChat => {
        setChats(prev => prev.map(chat => 
          chat.id === newChat.id ? { ...savedChat, id: newChat.id } : chat
        ));
      })
      .catch(error => {
        console.error('Error creating chat:', error)
      })
    }
  }

  const selectChat = (id: string) => {
    console.log('Selecting chat with id:', id)
    console.log('Available chats:', chats.map(c => ({ id: c.id, title: c.title })))
    setCurrentChatId(id)
  }

  const deleteChat = (id: string) => {
    console.log('Deleting chat with id:', id)
    console.log('Current chats before deletion:', chats.map(c => ({ id: c.id, title: c.title })))
    
    // Find the chat to delete before removing it from state
    const chatToDelete = chats.find(chat => chat.id === id)
    
    setChats((prev) => {
      const newChats = prev.filter((chat) => chat.id !== id)
      console.log('Chats after deletion:', newChats.map(c => ({ id: c.id, title: c.title })))
      // If we're deleting the current chat, select the first chat in the list
      if (currentChatId === id && newChats.length > 0) {
        setCurrentChatId(newChats[0].id)
      } else if (currentChatId === id) {
        setCurrentChatId(null)
      }
      return newChats
    })

    if (isSignedIn && userId && chatToDelete?._id) {
      fetch('/api/chats', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId: chatToDelete._id })
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
        if (chat.id === currentChatId) {
          const updatedChat = { 
            ...chat,
            messages: [...chat.messages, newMessage],
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

  const updateChatTitle = (chatId: string, title: string) => {
    // Find the chat to update before modifying state
    const chatToUpdate = chats.find(chat => chat.id === chatId)
    
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title } : chat
      )
    );

    if (isSignedIn && userId && chatToUpdate?._id) {
      fetch('/api/chats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatToUpdate._id,
          title,
          messages: chatToUpdate.messages
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
