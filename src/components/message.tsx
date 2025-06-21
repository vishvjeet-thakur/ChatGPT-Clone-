"use client"

import { Button } from "@/components/ui/button"
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Edit, Check, Send, X } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"
import type { Components } from "react-markdown"
import "highlight.js/styles/github-dark.css"
import React from "react"
import { useChat  } from "@/components/chat-provider"
import { FileViewerDialog } from "@/components/file-viewer-dialog"
import TextareaAutosize from 'react-textarea-autosize';
import { Chat } from "@/types/chat"
import { Memory } from "mem0ai"
import { FilePreviewCard } from "./ui/file-preview-card"

interface MessageProps {
  message: {
    id: string
    role: "user" | "assistant"
    content: string
    uploads: { url: string, mimeType: string, uuid: string , name:string }[]
    timestamp: Date
    messageType?: "code" | "chat"
  }
  isLoading?: boolean,
  onToggleSideBar?: () => void;
  sidebarOpen?: boolean
  handleSubmit?: (inputText: string) => void;
}

export function Message({ message, isLoading , onToggleSideBar , sidebarOpen, handleSubmit }: MessageProps) {
  const [copied, setCopied] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ url: string, mimeType: string } | null>(null)
  const { setMessage ,isEditorOpen ,setIsEditorOpen , setEditingCode, getCurrentChat, currentChatId, setChats, userId } = useChat()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(message.content)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false);
  const message_to_be_shown = message.content.replace(/<uploaded_content>[\s\S]*?<\/uploaded_content>/, '').trim()

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message_to_be_shown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setEditValue(message.content)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditValue(message.content)
  }

  const handleEditSend = async () => {
    setIsEditing(false)
    // Remove all messages from this message downwards
    const chat = getCurrentChat && getCurrentChat()
    if (chat && setChats && currentChatId) {
      const idx = chat.messages.findIndex(m => m.id === message.id)
      if (idx !== -1) {
        setChats((prevChats:Chat[]) => prevChats.map((c: Chat) =>
          c.id === currentChatId
            ? { ...c, messages: c.messages.slice(0, idx) }
            : c
        ))  
      }
    }
    if (handleSubmit) {
      handleSubmit(editValue)
    }
  }

  // Regenerate handler for assistant messages
  const handleRegenerate = async () => {
    setIsRegenerating(true)
    const chat = getCurrentChat && getCurrentChat()
    if (!chat) return setIsRegenerating(false)
    const idx = chat.messages.findIndex(m => m.id === message.id)
    if (idx === -1) return setIsRegenerating(false)
    // Find the previous user message
    let userMsg = null
    for (let i = idx - 1; i >= 0; i--) {
      if (chat.messages[i].role === 'user') {
        userMsg = chat.messages[i]
        break
      }
    }
    if (!userMsg) return setIsRegenerating(false)
    // Prepare context: all messages up to and including the current assistant message
    const contextMessages = chat.messages.slice(0, idx )
    // Optionally, tweak temperature or other params
    let memory = ""
    if (userId) {
      try {
        const response = await fetch('/api/memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userMsg.content, userId })
        })
        const memory_response = await response.json()
        if (Array.isArray(memory_response)) {
          memory_response.forEach((mem: Memory) => { memory += mem.memory })
        }
      } catch(e){ 
        console.error("Error while querying memory:",e)
      }
    }
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: contextMessages.map(m => ({ role: m.role, content: m.content })),
          memory,
          temperature: 0.9 // slightly higher for more variety
        })
      })
      if (!response.ok) throw new Error('Failed to regenerate')
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""
      setMessage(message.id,"")
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          assistantMessage += chunk
          setMessage(message.id, assistantMessage)
        }
      }
      console.log("assistant message-", assistantMessage)
      if (!assistantMessage) setMessage(message.id, "I apologize, but I encountered an error processing your request.")
    } catch (e) {
      setMessage(message.id, "I apologize, but I encountered an error processing your request. Please try again.")
      console.error("Error while regeneration: ",e)
    }
    setIsRegenerating(false)
  }



  const components: Components = {
    pre({ className, children, ...props }) {
      const codeElement = React.isValidElement(children) ? children : null;
      const LangclassName = (codeElement?.props as { className?: string })?.className || "";
      
      
      const match = /language-(\w+)/.exec(LangclassName || "");

      const getTextContent = (element: React.ReactElement | null): string => {
        if (!element) return '';
        const props = element.props as { children?: React.ReactNode };
        if (typeof props.children === 'string') return props.children;
        if (Array.isArray(props.children)) {
          return props.children
            .map((child: React.ReactNode) => {
              if (typeof child === 'string') return child;
              if (React.isValidElement(child)) return getTextContent(child);
              return '';
            })
            .join('');
        }
        return '';
      };

      const handleCopy = () => {
        const textContent = getTextContent(codeElement);
        navigator.clipboard.writeText(textContent).then(() => {
          setCodeCopied(true);
          setTimeout(() => setCodeCopied(false), 2000);
        }).catch(console.error);
      };

      const handleEdit = () => {
        const code = getTextContent(codeElement);
        const language = match ? match[1] : "text";
        setEditingCode({ code, language });
        if(sidebarOpen){
          onToggleSideBar?.();
        }
        setIsEditorOpen(true);
        
      };

      return (
        <div className="relative my-4 md:my-6 rounded-xl overflow-hidden !bg-[#171616] w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-3 md:px-4 py-2 text-xs">
            <span className="text-gray-100 text-xs tracking-wider">
              {match ? match[1] : "text"}
            </span>
            <div className="flex">
              <button
                onClick={handleCopy}
                className="flex text-gray-100 hover:text-white px-1 py-1 transition text-xs"
              >
                {codeCopied ? <Check className="h-[11px] md:h-[13px]" /> : <Copy className="h-[11px] md:h-[13px]" />}
                {codeCopied ? "Copied!" : "Copy"}
              </button>
              <button 
                onClick={handleEdit}
                className="hidden md:flex py-1 px-1 text-xs text-gray-100 hover:text-white transition"
              >
                <Edit className="h-[13px]" />
                Edit
              </button>
            </div>
          </div>

          {/* Code Block */}
          <pre className="overflow-x-auto text-[14px] !leading-[21px] md:text-sm text-white m-0 p-0 w-full">
            <code className={`${className} block w-full break-words whitespace-pre-wrap ${!match ? "px-3 md:px-4 py-2" : ""}`} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
  
    // For inline code
    code({ node, className, children, ...props }) {
      // If inside a <pre>, let `pre` handle the styling
      const isInline = !node?.position?.start || node.position.start.line === node.position.end.line;
  
      if (isInline) {
        return (
          // <pre className="inline">
          <code
            className="rounded bg-[#424242] px-1 py-0.5 font-normal  text-sm text-white"
            {...props}
          >
            {children}
          </code>
        );
      }
  
      // fallback for any edge cases (rare)
      return (
        <code className={`${className} !bg-[#171616]`} {...props}>
          {children}
        </code>
      );
    },
    p(props) {
      return <p className="whitespace-pre-wrap my-2 font-[400] !text-[16px] !leading-[28px] prose-code:!font-[500] prose-code:leading-[25px]" {...props} />;
    },
    hr(props){
       return <hr className=" border-t  border-[#ffffff0f] "  {...props}/>
    },
    h1(props) {
      return <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />;
    },
    h2(props) {
      return <h2 className="!text-[24px] font-[600] leading-[32px]  mt-7 mb-3" {...props} />;
    },
    h3(props) {
      return <h3 className="!text-[20px] !font-[600] mt-6 mb-3 !leading-[32px]" {...props} />;
    },
    h4(props) {
      return <h4 className="text-lg font-bold mt-5 mb-2" {...props} />;
    },
    h5(props) {
      return <h5 className="text-base font-bold mt-4 mb-2" {...props} />;
    },
    h6(props) {
      return <h6 className="text-sm font-bold mt-3 mb-2" {...props} />;
    },
    ul(props) {
      return <ul className="list-disc  pl-6 my-4 marker:text-white prose-li:!leading-[28px] prose-li:!text-[16px] prose-code:!font-[500] prose-code:!leading-[25px]" {...props} />;
    },
    ol(props) {
      return <ol className="list-decimal pl-6 my-4 prose-li:!leading-[28px] prose-li:!text-[16px] prose-code:!font-[500] prose-code:!leading-[25px]" {...props} />;
    },
    blockquote(props) {
      return <blockquote className="border-l-4 border-muted pl-4 italic my-4" {...props} />;
    },
    table(props) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="border-collapse border border-muted" {...props} />
        </div>
      );
    },
    th(props) {
      return <th className="border border-muted px-4 py-2 bg-muted" {...props} />;
    },
    td(props) {
      return <td className="border border-muted px-4 py-2" {...props} />;
    },
  }

  

  return (
    <div className={`flex gap-2 md:gap-4  ${message.role === "user" ? "justify-end" : ""}`}>
      <div className={`flex-1 ${message.role === "user" ? "order-first" : ""} ${isEditorOpen ? "w-1/2" : "max-w-3xl"}`}>
        {
          message.uploads.length>0 &&
          <div className="flex justify-end ">
            {
              message.uploads.map((file, idx) => (
                <div key={idx} className="relative group ml-2 mb-1  md:ml-3">
                  {file.mimeType.startsWith("image/") ? (
                    <img 
                      src={file.url} 
                      alt="preview" 
                      className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => setSelectedFile(file)}
                    />
                  ) : (

                    <FilePreviewCard
                    key={file.uuid}
                    fileName={file.name}
                    fileType={file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                    onClick={() => setSelectedFile(file)}
                    />
                    
                  )}
                </div>
              ))
            }
          </div>
        }
        <div
          className={`relative group/message ${
            message.role === "user"
              ? message.messageType === "code"
                ? "bg-[#1E1E1E] rounded-lg p-3 md:p-4" // Special styling for code messages
                : "text-white ml-auto max-w-[85%] md:max-w-lg rounded-2xl md:rounded-3xl p-2 md:p-3 pl-4 md:pl-5"
              : "text-white p-2 md:p-3"
          }`}
          style={{
            backgroundColor: message.role === "assistant" 
              ? "rgb(32,32,33)" 
              : message.messageType === "code"
                ? "rgb(30,30,30)" // Darker background for code messages
                :isEditing
                ?"rgb(67,66,67)"
                :message_to_be_shown
                ? "rgb(49,48,49)"
                :""
          }}
        >
          {message.role === "user" && message.messageType === "code" && (
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-1 bg-blue-600/20 rounded text-xs text-blue-400 font-medium">
                Code Analysis
              </div>
            </div>
          )}
          {isLoading &&
          <div>
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
                </div>
                }
          
          {isEditing ? (
            <div className="flex flex-col gap-2 bg-[rgb(67,66,67)]">
              <TextareaAutosize
                className="w-full resize-none bg-transparent text-white placeholder:text-gray-400 border-none focus:outline-none focus:ring-0 focus:border-none p-0 m-0"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                autoFocus
                maxRows={7}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditCancel}
                  className="flex items-center gap-1 rounded-full  text-white bg-[rgb(32,33,32)] hover:![rgb(32,32,32)]"
                >
                  <X size={12} />
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditSend}
                  className="flex items-center gap-1 rounded-full !text-black bg-white hover:!bg-gray-200  "
                >
                  <Send size={12}  />
                  Send
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-neutral dark:prose-invert max-w-none text-sm md:text-base" aria-live={message.role === "assistant" ? "polite" : undefined}>
              <ReactMarkdown
                remarkPlugins={[[remarkGfm, { breaks: true }]]}
                rehypePlugins={[
                  rehypeRaw,
                  rehypeSanitize,
                  [rehypeHighlight, { ignoreMissing: true }],
                ]}
                components={components}
              >
                {message.content.replace(/<uploaded_content>[\s\S]*?<\/uploaded_content>/, '').trim()}
              </ReactMarkdown>
            </div>
          )}
          {/* User message action buttons (Edit, Copy) */}
          {message.role === "user" && !isLoading && (
            <div className="absolute right-1 -bottom-7 flex gap-2 pointer-events-auto z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                aria-label="Copy message"
                className="h-7 w-7 md:h-8 md:w-8 p-0 text-white hover:text-white hover:bg-gray-700"
              >
                <Copy size={14} className="text-white" />
              </Button>
              {message.uploads.length === 0 && message_to_be_shown && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  aria-label="Edit message"
                  className="h-7 w-7 md:h-8 md:w-8 p-0 text-white hover:text-white hover:bg-gray-700"
                >
                  <Edit size={14} className="text-white" />
                </Button>
              )}
            </div>
          )}
        </div>

        {message.role === "assistant" && (!isLoading || isRegenerating) && (
          <div className="flex items-center gap-1 md:gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              aria-label="Copy message"
              className="h-7 w-7 md:h-8 md:w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            > 
              {copied?<Check size={12} className="md:w-3.5 md:h-3.5 "/> : <Copy size={12} className="md:w-3.5 md:h-3.5 " />}
              
              
            </Button>
            <Button variant="ghost" size="sm" aria-label="Thumbs up" className="h-7 w-7 md:h-8 md:w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700">
              <ThumbsUp size={12} className="md:w-3.5 md:h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" aria-label="Thumbs down" className="h-7 w-7 md:h-8 md:w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700">
              <ThumbsDown size={12} className="md:w-3.5 md:h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              aria-label="Regenerate response"
              disabled={isRegenerating}
              className="h-7 w-7 md:h-8 md:w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            >
              <RotateCcw size={12} className={`md:w-3.5 md:h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </div>
      <FileViewerDialog 
        isOpen={!!selectedFile} 
        onClose={() => setSelectedFile(null)} 
        file={selectedFile}
      />
    </div>
  )
}
