"use client"

import React, { createContext, useContext, useRef, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@clerk/nextjs"
import { v4 as uuidv4 } from "uuid"
import { Chat, Message } from "@/types/chat"
import { saveChatsToLocalStorage, loadChatsFromLocalStorage, clearLocalChats } from "@/lib/utils"

/**
 * Interface for code editing functionality
 * Used when editing code blocks in the chat interface
 */
interface CodeInterface {
  code: string
  language: string
}

/**
 * Type definition for the Chat Context
 * Provides all the state and functions needed for chat functionality
 */
interface ChatContextType {
  // Chat state
  chats: Chat[]
  currentChatId: string | null
  isLoading: boolean
  
  // Editor state
  isEditorOpen: boolean | null
  editingCode: CodeInterface | null
  
  // Recording state
  isRecording: boolean
  
  // File upload state
  uploadedFiles: { url: string, mimeType: string, uuid: string }[]
  setUploadedFiles: (file: { url: string, mimeType: string, uuid: string }[]) => void
  
  // State setters
  setIsRecording: (val: boolean) => void
  setEditingCode: (code: CodeInterface | null) => void
  setIsEditorOpen: (val: boolean) => void
  
  // Chat management functions
  createNewChat: () => void
  selectChat: (id: string) => void
  deleteChat: (id: string) => void
  addMessage: (content: string, role: "user" | "assistant", uploads?: { url: string, mimeType: string, uuid: string }[], messageType?: "code" | "chat") => string
  getCurrentChat: () => Chat | null
  setMessage: (messageId: string, content: string) => void
  updateChatTitle: (chatId: string, title: string) => void
  
  // Audio recording reference
  waveformRef: React.RefObject<HTMLDivElement | null>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

/**
 * ChatProvider Component
 * 
 * Provides global state management for the chat application including:
 * - Chat history and current chat management
 * - Message handling and streaming
 * - File upload state
 * - Code editor state
 * - Authentication state sync
 * - Local storage and database persistence
 * 
 * @param children - React components that will have access to chat context
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const { userId, isSignedIn } = useAuth()
  
  // Core state
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false)
  const [editingCode, setEditingCode] = useState<CodeInterface | null>(null)
  
  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false)
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string, mimeType: string, uuid: string }[]>([])
  
  // Audio recording reference
  const waveformRef = useRef<HTMLDivElement | null>(null)

  /**
   * Load chats from database or local storage based on authentication status
   * - For signed-in users: Load from MongoDB database
   * - For unsigned users: Load from browser local storage
   */
  useEffect(() => {
    if (isSignedIn && userId) {
      // Load chats from database for authenticated users
      setIsLoading(true)
      fetch('/api/chats')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            console.log('Loaded chats from database:', data)
            // Ensure all chats have a local id field for consistency
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

  /**
   * Persist chats to database or local storage based on authentication status
   * - For signed-in users: Save to MongoDB database
   * - For unsigned users: Save to browser local storage
   */
  useEffect(() => {
    if (isSignedIn && userId && chats.length > 0) {
      // Save to database for authenticated users
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

  /**
   * Clear local storage when user signs in to avoid conflicts
   * This ensures clean state transition from local to database storage
   */
  useEffect(() => {
    if (isSignedIn) {
      clearLocalChats()
    }
  }, [isSignedIn])

  /**
   * Creates a new chat session
   * - Generates a unique ID for the chat
   * - Adds it to the beginning of the chat list
   * - Sets it as the current chat
   * - For authenticated users: Saves to database
   * - Prevents creating multiple empty chats
   */
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

    // Save to database for authenticated users
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

  /**
   * Selects a chat by ID
   * @param id - The unique identifier of the chat to select
   */
  const selectChat = (id: string) => {
    console.log('Selecting chat with id:', id)
    console.log('Available chats:', chats.map(c => ({ id: c.id, title: c.title })))
    setCurrentChatId(id)
  }

  /**
   * Deletes a chat by ID
   * - Removes from local state
   * - For authenticated users: Removes from database
   * - Automatically selects the first remaining chat
   * @param id - The unique identifier of the chat to delete
   */
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

    // Delete from database for authenticated users
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

  /**
   * Adds a new message to the current chat
   * - Creates a unique ID for the message
   * - Adds it to the current chat's message array
   * - Updates the chat in state
   * - Returns the message ID for streaming updates
   * 
   * @param content - The message content (text, markdown, etc.)
   * @param role - The role of the message sender ("user" or "assistant")
   * @param uploads - Optional array of uploaded files attached to the message
   * @param messageType - Optional type of message ("code" or "chat")
   * @returns The unique ID of the created message
   */
  const addMessage = (content: string, role: "user" | "assistant", uploads: { url: string, mimeType: string, uuid: string }[] = [], messageType: "code" | "chat" = "chat") => {
    const messageId = uuidv4()
    const newMessage: Message = {
      id: messageId,
      role,
      content,
      uploads,
      timestamp: new Date(),
    }

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    )

    return messageId
  }

  /**
   * Gets the currently selected chat
   * @returns The current chat object or null if no chat is selected
   */
  const getCurrentChat = () => {
    return chats.find((chat) => chat.id === currentChatId) || null
  }

  /**
   * Updates the content of a specific message
   * Used primarily for streaming responses where content is updated incrementally
   * 
   * @param messageId - The unique identifier of the message to update
   * @param content - The new content for the message
   */
  const setMessage = (messageId: string, content: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: chat.messages.map((message) =>
                message.id === messageId
                  ? { ...message, content }
                  : message
              ),
            }
          : chat
      )
    )
  }

  /**
   * Updates the title of a specific chat
   * @param chatId - The unique identifier of the chat to update
   * @param title - The new title for the chat
   */
  const updateChatTitle = (chatId: string, title: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title } : chat
      )
    )
  }

  // Context value containing all state and functions
  const value: ChatContextType = {
    chats,
    currentChatId,
    isEditorOpen,
    editingCode,
    isRecording,
    isLoading,
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
    waveformRef,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

/**
 * Custom hook to access the chat context
 * Provides type-safe access to all chat functionality
 * 
 * @returns The chat context with all state and functions
 * @throws Error if used outside of ChatProvider
 */
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
