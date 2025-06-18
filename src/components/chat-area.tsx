"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/components/chat-provider"
import { PanelLeft } from "lucide-react"
import { Message as MessageComponent } from "@/components/message"
import { Message } from "@/types/chat"
import { CodeEditor } from "./code-editor"
import { ChatInput } from "@/components/chat-input"
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Memory } from "mem0ai"

/**
 * Props interface for the ChatArea component
 * Defines the props required for the chat area functionality
 */
interface ChatAreaProps {
  /** Whether the sidebar is currently open */
  sidebarOpen: boolean
  /** Function to toggle the sidebar visibility */
  onToggleSidebar: () => void
}

/**
 * ChatArea Component
 * 
 * The main chat interface that provides:
 * - Message display and history
 * - Real-time streaming responses
 * - File upload and processing
 * - Code editing capabilities
 * - User authentication integration
 * - Responsive design for different screen sizes
 * 
 * Features:
 * - Automatic scrolling to latest messages
 * - File processing and AI analysis
 * - Streaming response handling
 * - Code editor integration
 * - Chat title generation
 * - Error handling and fallbacks
 * 
 * @param props - ChatAreaProps containing sidebar state and toggle function
 * @returns JSX element representing the main chat interface
 */
export function ChatArea({ sidebarOpen, onToggleSidebar }: ChatAreaProps) {
  // Chat context for global state management
  const { 
    getCurrentChat, 
    addMessage, 
    createNewChat, 
    currentChatId, 
    setMessage, 
    isEditorOpen, 
    updateChatTitle, 
    editingCode, 
    setIsEditorOpen, 
    setEditingCode, 
    uploadedFiles, 
    setUploadedFiles,
    getOptimizedMessages,
    userId
  } = useChat()
  
  // Local state for component functionality
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Get current chat and messages
  const currentChat = getCurrentChat()
  const messages = currentChat?.messages || []
  const optimizedMessages = getOptimizedMessages()


  /**
   * Auto-scroll to bottom when new messages are added
   * Ensures users always see the latest messages
   */
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [currentChat?.messages])

  /**
   * Create a new chat if none exists
   * Ensures users always have a chat to work with
   */
  useEffect(() => {
    if (!currentChat) {
      createNewChat()
    }
  }, [])

  /**
   * Handles form submission for new messages
   * - Validates input and uploaded files
   * - Processes uploaded files with AI analysis
   * - Sends message to OpenAI API
   * - Handles streaming responses
   * - Generates chat titles for new conversations
   * - Manages loading states and error handling
   * 
   * @param userMessage - The user's input text
   */
  const handleSubmit = async (userMessage: string) => {
    if (!userMessage.trim() && uploadedFiles.length === 0) return
    
    const final_uploaded_files = uploadedFiles
    setIsLoading(true)
    setUploadedFiles([])
  
    // Ensure we have a current chat
    if (!currentChatId) {
      createNewChat()
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  
    // Process uploaded files for AI analysis
    let uploaded_content = "<uploaded_content>\n"
    let image_num = 0
    let file_num = 0
  
    // Process all uploaded files in parallel
    await Promise.all(
      final_uploaded_files.map(async (file) => {
        try {
          const response = await fetch("api/process-file", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: file.url, mimeType: file.mimeType }),
          })
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
  
          const content = await response.text()
          if (file.mimeType.startsWith("image/")) {
            uploaded_content += `Uploaded image ${++image_num}: `
          } else {
            uploaded_content += `Uploaded file ${++file_num}: `
          }
          uploaded_content += content + "\n"
        } catch (err) {
          console.error("Error processing file:", file, err)
        }
      })
    )
    
    uploaded_content += "</uploaded_content>\n"
    if (final_uploaded_files.length == 0) {
      uploaded_content = ""
    }


  
    // Add user message to chat
    const userMessageId = addMessage(uploaded_content + userMessage, "user", final_uploaded_files)
    const assistantMessageId = addMessage("", "assistant")

    let memory=""
    if(userId)
      {
      const response = await fetch('api/memory',{
        method:'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
         query:uploaded_content+userMessage,userId
        }),
      })
   
      const memory_response:Memory[] = await response.json();
      memory_response.forEach((mem)=>{
          memory+=mem.memory
      })
      console.log("memory fetched:",memory)
      }
  
    try {
      // Send message to OpenAI API for streaming response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...(optimizedMessages || []), {
            role: "user",
            content: uploaded_content + userMessage,
          }],
          memory,
        }),
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""
  
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          assistantMessage += chunk
          setMessage(assistantMessageId, assistantMessage)
        }
      }

      const interaction = [
        {"role":"user" as const,'content':uploaded_content+userMessage},
        {"role":"assistant" as const,'content':assistantMessage}
      ]
      
      if(userId)
        {
        const memory_response = await fetch('api/memory',{
          method:'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
           interaction,userId
          }),
        })
        const memory_added = await memory_response.json();
        console.log("memory_added",memory_added)
        }

      // Handle empty responses
      if (!assistantMessage) {
        setMessage(assistantMessageId, "I apologize, but I encountered an error processing your request.")
      }
  
      // Generate chat title for new conversations
      if (getCurrentChat()!.messages.length <= 1) {
        try {
          const titleResponse = await fetch("/api/generate-title", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [{ role: "user", content: uploaded_content + userMessage }],
            }),
          })
  
          if (!titleResponse.ok) throw new Error(`HTTP error! status: ${titleResponse.status}`)
  
          const titleReader = titleResponse.body?.getReader()
          const titleDecoder = new TextDecoder()
          let newTitle = ""
  
          if (titleReader) {
            while (true) {
              const { done, value } = await titleReader.read()
              if (done) break
  
              const chunk = titleDecoder.decode(value, { stream: true })
              newTitle += chunk
              const cleanTitle = newTitle.replace(/["']/g, "").trim()
              updateChatTitle(currentChatId!, cleanTitle)
            }
          }
        } catch (error) {
          console.error("Title generation error:", error)
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessage(assistantMessageId, "I apologize, but I encountered an error processing your request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles keyboard events for the input field
   * - Submits form on Enter (without Shift)
   * - Allows multi-line input with Shift+Enter
   * 
   * @param e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      
      // The ChatInput component will handle submission internally
    }
  }

  /**
   * Handles code saving from the code editor
   * - Adds the edited code as a user message
   * - Sends code for AI analysis
   * - Handles streaming response for code feedback
   * 
   * @param code - The edited code content
   */
  const handleSaveCode = async (code: string) => {
    if (!editingCode) return

    // Add the code as a user message with special formatting
    const userMessageId = addMessage(`\`\`\`${editingCode.language}\n${code}\n\`\`\``, "user", [], "code")
    const assistantMessageId = addMessage("", "assistant")
    setIsLoading(true)
    
    try {
      // Send code for analysis
      const response = await fetch("/api/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language: editingCode.language }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle streaming response for code analysis
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
            setMessage(assistantMessageId, assistantMessage)
          }
        } catch (streamError) {
          console.error("Stream reading error:", streamError)
        }
      }

      // Handle empty responses
      if (!assistantMessage) {
        setMessage(assistantMessageId, "I apologize, but I encountered an error processing your request.")
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessage(assistantMessageId, "I apologize, but I encountered an error processing your request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white " style={{ backgroundColor: "rgb(32,32,33)" }}>
      {/* Header Section */}
      <div
        className="border-b border-gray-600 p-4 flex items-center justify-between"
        style={{ backgroundColor: "rgb(32,32,33)", borderColor: "rgb(64,64,64)" }}
      >
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Button */}
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
        
        {/* Authentication Buttons */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* Main Content Area */}
      {currentChat?.messages.length === 0 || !currentChat ? (
        // Empty State: Show welcome message and input
        <div className={`flex-1 flex flex-col justify-center ${isEditorOpen ? "mr-10" : "w-full"} h-full px-4`}>
          <div className={`text-center ${isEditorOpen ? "" : "w-full max-w-3xl mx-auto"}`}>
            <h2 className={`text-3xl ${isEditorOpen ? "w-1/2" : ""} font-semibold text-white mb-6`}>
              What's today's agenda?
            </h2>
            <ChatInput
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      ) : (
        // Chat State: Show messages and input
        <>
          {/* Messages Scroll Area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
            <div className={`space-y-6 py-6 max-w-3xl ${!isEditorOpen ? "w-full mx-auto" : "w-1/2"}`}>
              {/* Render all messages */}
              {messages.map((message: Message) => (
                <MessageComponent 
                  key={message.id} 
                  message={message} 
                  onToggleSideBar={onToggleSidebar} 
                  sidebarOpen={sidebarOpen} 
                />
              ))}
              
              {/* Loading indicator for streaming responses */}
              {isLoading && (
                <MessageComponent
                  message={{
                    id: "loading",
                    role: "assistant",
                    content: "",
                    uploads: [],
                    timestamp: new Date(),
                  }}
                  isLoading={true}
                />
              )}
            </div>
          </ScrollArea>
          
          {/* Chat Input */}
          <ChatInput
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
          />
        </>
      )}

      {/* Code Editor Modal */}
      {isEditorOpen && editingCode && (
        <CodeEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setEditingCode(null)
          }}
          initialCode={editingCode.code}
          language={editingCode.language}
          onSave={handleSaveCode}
        />
      )}
    </div>
  )
}
