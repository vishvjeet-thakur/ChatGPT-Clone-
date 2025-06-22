"use client"

import type React from "react"

import { useState, useRef, useEffect} from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/components/chat-provider"
import { PanelLeft } from "lucide-react"
import { Message as MessageComponent } from "@/components/message"
import { Message } from "@/types/chat"
import { CodeEditor } from "./code-editor"
import { ChatInput } from "@/components/chat-input"
import {
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
  const [pendingMessage,setPendingMessage]= useState<{text:string,upload:{url:string,mimeType:string,uuid:string, name:string}[]}>({text:"",upload:[]})
  
  useEffect(()=>{
    if((pendingMessage.text!="" || pendingMessage.upload.length>0) && currentChatId!=null)
    { 
      handleSubmit(pendingMessage.text,pendingMessage.upload);
      setPendingMessage({text:"",upload:[]});
    }
  },[currentChatId,currentChat])


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
  const handleSubmit = async (userMessage: string,uploads:{url:string,mimeType:string,uuid:string,name:string}[]=[]) => {
    if (!userMessage.trim() && uploadedFiles.length === 0) return
    setIsLoading(true)
    if (!currentChatId || !currentChat) {
      setPendingMessage({text:userMessage,upload:uploadedFiles})
      await new Promise(resolve => setTimeout(resolve, 1000));
      await createNewChat()
      setUploadedFiles([])
      return;
    }
  
    const final_uploaded_files = uploadedFiles.length?uploadedFiles:uploads
    setUploadedFiles([])
   
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
    addMessage(uploaded_content + userMessage, "user", final_uploaded_files)
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
      if(Array.isArray(memory_response))
      {
       memory_response.forEach((mem)=>{
          memory+=mem.memory
      })
    }
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

       // Handle empty responses
       if (!assistantMessage) {
        setMessage(assistantMessageId, "I apologize, but I encountered an error processing your request.")
      }

      setIsLoading(false)

      const interaction = [
        {"role":"user" as const,'content':uploaded_content+userMessage},
        {"role":"assistant" as const,'content':assistantMessage}
      ]
      
     
  
      // Add to memory and generate title in parallel (if needed)
      const parallelTasks: Promise<unknown>[] = [];
      if(userId && assistantMessage && userMessage) {
        const memoryPromise = fetch('api/memory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ interaction, userId }),
        }).then(res => res.json());
        parallelTasks.push(memoryPromise);
      }
      if (getCurrentChat()!.messages.length <= 1) {
        const titlePromise = (async () => {
          try {
            const titleResponse = await fetch('/api/generate-title', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messages: [{ role: 'user', content: uploaded_content + userMessage }],
              }),
            });
            if (!titleResponse.ok) throw new Error(`HTTP error! status: ${titleResponse.status}`);
            const titleReader = titleResponse.body?.getReader();
            const titleDecoder = new TextDecoder();
            let newTitle = '';
            if (titleReader) {
              while (true) {
                const { done, value } = await titleReader.read();
                if (done) break;
                const chunk = titleDecoder.decode(value, { stream: true });
                newTitle += chunk;
                const cleanTitle = newTitle.replace(/["']/g, '').trim();
                updateChatTitle(currentChatId!, cleanTitle);
              }
            }
          } catch (error) {
            console.error('Title generation error:', error);
          }
        })();
        parallelTasks.push(titlePromise);
      }
      // Wait for all parallel tasks to finish (optional, or just fire and forget)
      if (parallelTasks.length > 0) {
        Promise.all(parallelTasks).catch(console.error);
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessage(assistantMessageId, "I apologize, but I encountered an error processing your request. Please try again.")
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
    addMessage(`\`\`\`${editingCode.language}\n${code}\n\`\`\``, "user", [], "code")
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
    <div className={`flex-1 flex flex-col h-full   transition-all duration-300 ease-in-out `} style={{ backgroundColor: "rgb(32,32,33)" }}>
      {/* Header Section */}
      <div
        className=" border-gray-600 p-2 mt-1 flex items-center relative justify-between"
        style={{ backgroundColor: "rgb(32,32,33)", borderColor: "rgb(64,64,64)", }}
      > 
        <div className="left-0 md:hidden" onClick={onToggleSidebar}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip="" className="icon-lg text-token-text-secondary mx-2"><path d="M11.6663 12.6686L11.801 12.6823C12.1038 12.7445 12.3313 13.0125 12.3313 13.3337C12.3311 13.6547 12.1038 13.9229 11.801 13.985L11.6663 13.9987H3.33325C2.96609 13.9987 2.66839 13.7008 2.66821 13.3337C2.66821 12.9664 2.96598 12.6686 3.33325 12.6686H11.6663ZM16.6663 6.00163L16.801 6.0153C17.1038 6.07747 17.3313 6.34546 17.3313 6.66667C17.3313 6.98788 17.1038 7.25586 16.801 7.31803L16.6663 7.33171H3.33325C2.96598 7.33171 2.66821 7.03394 2.66821 6.66667C2.66821 6.2994 2.96598 6.00163 3.33325 6.00163H16.6663Z"></path></svg>
        </div>

        <h1 className="text-lg font-normal  text-white  ml-0 absolute left-1/2 -translate-x-1/2 text-center
  md:static md:left-auto md:translate-x-0 md:text-left md:ml-3 ">ChatGPT</h1>
        
        {/* Authentication Buttons */}
        <div className=" items-center gap-3 ml-auto hidden md:flex"> 
          <SignedOut>
            <SignInButton mode="modal">
            <button className="px-3 py-2 hover:bg-gray-200  bg-white text-[#0d0d0d] rounded-full  font-[500] text-sm">
               Log in
            </button>
            </SignInButton>
            <SignUpButton mode="modal" >
         <button className=" font-[500] text-sm text-white hover:bg-[#2e2f2e] bg-[#202120] rounded-full border-gray-600 border px-3 py-2 "  > 
              Sign up for free
          </button>
            </SignUpButton >
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        <div className="flex md:hidden ml-auto" onClick={createNewChat}>
          <button>        
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon"><path d="M2.6687 11.333V8.66699C2.6687 7.74455 2.66841 7.01205 2.71655 6.42285C2.76533 5.82612 2.86699 5.31731 3.10425 4.85156L3.25854 4.57617C3.64272 3.94975 4.19392 3.43995 4.85229 3.10449L5.02905 3.02149C5.44666 2.84233 5.90133 2.75849 6.42358 2.71582C7.01272 2.66769 7.74445 2.66797 8.66675 2.66797H9.16675C9.53393 2.66797 9.83165 2.96586 9.83179 3.33301C9.83179 3.70028 9.53402 3.99805 9.16675 3.99805H8.66675C7.7226 3.99805 7.05438 3.99834 6.53198 4.04102C6.14611 4.07254 5.87277 4.12568 5.65601 4.20313L5.45581 4.28906C5.01645 4.51293 4.64872 4.85345 4.39233 5.27149L4.28979 5.45508C4.16388 5.7022 4.08381 6.01663 4.04175 6.53125C3.99906 7.05373 3.99878 7.7226 3.99878 8.66699V11.333C3.99878 12.2774 3.99906 12.9463 4.04175 13.4688C4.08381 13.9833 4.16389 14.2978 4.28979 14.5449L4.39233 14.7285C4.64871 15.1465 5.01648 15.4871 5.45581 15.7109L5.65601 15.7969C5.87276 15.8743 6.14614 15.9265 6.53198 15.958C7.05439 16.0007 7.72256 16.002 8.66675 16.002H11.3337C12.2779 16.002 12.9461 16.0007 13.4685 15.958C13.9829 15.916 14.2976 15.8367 14.5447 15.7109L14.7292 15.6074C15.147 15.3511 15.4879 14.9841 15.7117 14.5449L15.7976 14.3447C15.8751 14.128 15.9272 13.8546 15.9587 13.4688C16.0014 12.9463 16.0017 12.2774 16.0017 11.333V10.833C16.0018 10.466 16.2997 10.1681 16.6667 10.168C17.0339 10.168 17.3316 10.4659 17.3318 10.833V11.333C17.3318 12.2555 17.3331 12.9879 17.2849 13.5771C17.2422 14.0993 17.1584 14.5541 16.9792 14.9717L16.8962 15.1484C16.5609 15.8066 16.0507 16.3571 15.4246 16.7412L15.1492 16.8955C14.6833 17.1329 14.1739 17.2354 13.5769 17.2842C12.9878 17.3323 12.256 17.332 11.3337 17.332H8.66675C7.74446 17.332 7.01271 17.3323 6.42358 17.2842C5.90135 17.2415 5.44665 17.1577 5.02905 16.9785L4.85229 16.8955C4.19396 16.5601 3.64271 16.0502 3.25854 15.4238L3.10425 15.1484C2.86697 14.6827 2.76534 14.1739 2.71655 13.5771C2.66841 12.9879 2.6687 12.2555 2.6687 11.333ZM13.4646 3.11328C14.4201 2.334 15.8288 2.38969 16.7195 3.28027L16.8865 3.46485C17.6141 4.35685 17.6143 5.64423 16.8865 6.53613L16.7195 6.7207L11.6726 11.7686C11.1373 12.3039 10.4624 12.6746 9.72827 12.8408L9.41089 12.8994L7.59351 13.1582C7.38637 13.1877 7.17701 13.1187 7.02905 12.9707C6.88112 12.8227 6.81199 12.6134 6.84155 12.4063L7.10132 10.5898L7.15991 10.2715C7.3262 9.53749 7.69692 8.86241 8.23218 8.32715L13.2791 3.28027L13.4646 3.11328ZM15.7791 4.2207C15.3753 3.81702 14.7366 3.79124 14.3035 4.14453L14.2195 4.2207L9.17261 9.26856C8.81541 9.62578 8.56774 10.0756 8.45679 10.5654L8.41772 10.7773L8.28296 11.7158L9.22241 11.582L9.43433 11.543C9.92426 11.432 10.3749 11.1844 10.7322 10.8271L15.7791 5.78027L15.8552 5.69629C16.185 5.29194 16.1852 4.708 15.8552 4.30371L15.7791 4.2207Z"></path></svg>
          </button>  
        </div>
        
      </div>
      <hr className=" border-t border-[#ffffff0f]   h-px"></hr>  

      {/* Main Content Area */}
      {currentChat?.messages.length === 0 || !currentChat ? (
        // Empty State: Show welcome message and input
        <div className={`flex-1 flex flex-col justify-center ${isEditorOpen ? "mr-10" : "w-full"} h-full `}>
          <div className={`text-center ${isEditorOpen ? "" : "w-full max-w-3xl mx-auto"}`}>
            <h2 className={`text-3xl ${isEditorOpen ? "w-1/2" : ""} font-semibold text-white mb-6`}>
              What&apos;s today&apos;s agenda?
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
                  handleSubmit={handleSubmit}
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
