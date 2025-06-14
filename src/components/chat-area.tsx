"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/components/chat-provider"
import { Send, Square, PanelLeft, Plus, Mic } from "lucide-react"
import { Message as MessageComponent } from "@/components/message"
import { Chat, Message } from "@/types/chat"

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const ChatInput = ({ input, setInput, isLoading, onSubmit, onKeyDown }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-3xl mx-auto  pb-3 ">
      <form 
        onSubmit={onSubmit}
        className="w-full  rounded-3xl p-2 flex flex-col"
        style={{ backgroundColor: "rgb(49,48,49)", borderColor: "rgb(96,96,96)", maxHeight: "300px" }}
      >
        <div className="relative overflow-auto flex-1">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message ChatGPT..."
            className="w-full resize-none bg-gray-800 text-white placeholder:text-gray-400 border-none focus:outline-none focus:ring-0 focus:border-none"
            style={{ minHeight: "40px", maxHeight: "200px", backgroundColor: "rgb(49,48,49)" }}
            disabled={isLoading}
          />
        </div>
        <div className="flex items-center justify-between ">
          <label className="flex items-center cursor-pointer">
            <Plus className="w-5 h-5 text-gray-400 hover:text-white" />
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.txt"
            />
          </label>
          <div className="flex items-center gap-2">
            <button type="button" className="p-1 rounded-full hover:bg-gray-700">
              <Mic className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full"
            >
              {isLoading ? <Square size={16} /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </form>
      <p className="text-xs text-gray-400 mt-1 text-center">ChatGPT can make mistakes. Check important info.</p>
    </div>
  );
};

interface ChatAreaProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatArea({ sidebarOpen, onToggleSidebar }: ChatAreaProps) {
  const { getCurrentChat, addMessage, createNewChat, currentChatId, setMessage } = useChat();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentChat = getCurrentChat();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setIsLoading(true);
    setInput("");

    // Create new chat if none exists
    if (!currentChatId) {
      createNewChat();
      // Wait a bit for the chat to be created
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Add user message and get its ID
    const userMessageId = addMessage(userMessage, "user");
    console.log("userMessageId-", userMessageId)
    
    // Create empty assistant message and get its ID
    const assistantMessageId = addMessage("", "assistant");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...(getCurrentChat()?.messages || []), { role: "user", content: userMessage }],
          assistantMessageId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            assistantMessage += chunk;
            setMessage(assistantMessageId, assistantMessage);
          }
        } catch (streamError) {
          console.error("Stream reading error:", streamError);
        }
      }

      if (!assistantMessage) {
        setMessage(assistantMessageId, "I apologize, but I encountered an error processing your request.");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessage(assistantMessageId, "I apologize, but I encountered an error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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

      {/* Messages or Centered Agenda */}
      {currentChat?.messages.length === 0 || !currentChat ? (
        <div className="flex-1 flex flex-col justify-center w-full h-full px-4">
          <div className="text-center w-full max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold text-white mb-6">What's today's agenda?</h2>
            <ChatInput
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
            <div className="space-y-6 py-6 max-w-3xl w-full mx-auto">
              {currentChat.messages.map((message: Message) => (
                <MessageComponent key={message.id} message={message} />
              ))}
              {isLoading && (
                <MessageComponent
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
          </ScrollArea>
          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
          />
        </>
      )}
    </div>
  );
}
