"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/components/chat-provider"
import { Send, Square, PanelLeft, Plus, Mic, Loader2, X } from "lucide-react"
import { Message as MessageComponent } from "@/components/message"
import { Chat, Message } from "@/types/chat"
import { CodeEditor } from "./code-editor"
import { VoiceRecorder } from "@/components/voice-recorder"
import { uploadFile } from "@uploadcare/upload-client";
import {
  deleteFile,
  UploadcareSimpleAuthSchema,
} from '@uploadcare/rest-client';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { FileViewerDialog } from "@/components/file-viewer-dialog"


interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const ChatInput = ({ input, setInput, isLoading, onSubmit, onKeyDown }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isEditorOpen, isRecording, waveformRef , uploadedFiles, setUploadedFiles } = useChat();
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string, mimeType: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ url: string, mimeType: string } | null>(null);
  

  const handleDeleteFile = async (uuid: string) => {
    try {
      const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
        publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_API_KEY || '',
        secretKey: process.env.NEXT_PUBLIC_UPLOADCARE_SECRET_KEY || '',
      });

      await deleteFile(
        { uuid },
        { authSchema: uploadcareSimpleAuthSchema }
      );

      // Remove from uploaded files
      setUploadedFiles(uploadedFiles.filter(file => file.uuid !== uuid));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
  
    // Add files to uploading state
    const newUploadingFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      mimeType: file.type
    }));
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);
  
    const uploaded : { url: string, mimeType: string, uuid: string }[] = [];
  
    for (const file of Array.from(files)) {
      try {
        const result = await uploadFile(file, {
          publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_API_KEY || "" ,
          store:'auto'
        });
  
        uploaded.push({ 
          url: result.cdnUrl || "", 
          mimeType: file.type,
          uuid: result.uuid || ""
        });
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
  
    // Remove uploaded files from uploading state
    setUploadingFiles(prev => prev.filter(f => !newUploadingFiles.find(nf => nf.id === f.id)));
    setUploadedFiles([...uploadedFiles, ...uploaded]);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      // Create a File object with proper name and type
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      formData.append('audio', audioFile);

      console.log('Audio file type:', audioFile.type);
      console.log('Audio file size:', audioFile.size);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to transcribe audio: ${errorData.error || response.statusText}`);
      }

      const { text } = await response.json();
      const currentText = input.trim();
      const newText = text.trim();

      setInput(
        // Add a space between existing text and new text if both exist
        currentText ? `${currentText} ${newText}` : newText
      );
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className={`max-w-3xl ${!isEditorOpen ? "mx-auto w-full" : "w-1/2"} pb-3`}>
      <form 
        onSubmit={onSubmit}
        className="w-full rounded-3xl p-2 flex flex-col"
        style={{ backgroundColor: "rgb(49,48,49)", borderColor: "rgb(96,96,64)", maxHeight: "300px" }}
      >
        <div className="relative overflow-auto flex-1">
          <div className="flex flex-wrap mb-2 gap-2">
            {/* Show uploading files with spinner */}
            {uploadingFiles.map((file) => (
              <div key={file.id} className="relative">
                {file.mimeType.startsWith("image/") ? (
                  <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-700 text-white rounded-lg flex items-center justify-center text-xs text-center p-2">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Show uploaded files */}
            {uploadedFiles.map((file) => (
              <div key={file.uuid} className="relative">
                <button
                  type="button"
                  onClick={() => handleDeleteFile(file.uuid)}
                  className="absolute top-1 right-1 bg-red-500 rounded-full text-white hover:bg-red-700  p-1"
                >
                  <X size={16} />
                </button>
                {file.mimeType.startsWith("image/") ? (
                  <img 
                    src={file.url} 
                    alt="preview" 
                    className="w-24 h-24 object-cover rounded-lg border cursor-pointer  transition-opacity" 
                    onClick={() => setSelectedFile(file)}
                  />
                ) : (
                  <div 
                    className="w-24 h-24 bg-gray-700 text-white rounded-lg flex items-center justify-center text-xs text-center p-2 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setSelectedFile(file)}
                  >
                    📄 File<br />{file.mimeType.split("/")[1] || "File"}
                  </div>
                )}
              </div>
            ))}
          </div>
          {!isRecording?
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message ChatGPT..."
            className="w-full resize-none bg-gray-800 text-white placeholder:text-gray-400 border-none focus:outline-none focus:ring-0 focus:border-none"
            style={{ minHeight: "40px", maxHeight: "200px", backgroundColor: "rgb(49,48,49)" }}
            disabled={isLoading || isTranscribing}
          />:
          <div id="waveform"  ref={waveformRef} className="w-full resize-none bg-[rgb(49,48,49)] text-white placeholder:text-gray-400 border-none focus:outline-none focus:ring-0 focus:border-none"/> }
          
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <Plus className="w-5 h-5 text-gray-400 hover:text-white" />
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
          </label>
          <div className="flex items-center gap-2">
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              onCancel={() => setIsTranscribing(false)}
            />
            <Button
              type="submit"
              size="sm"
              disabled={ (!input.trim() && uploadedFiles.length==0 ) || isLoading || isTranscribing || isRecording}
              className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full"
            >
              {isLoading || isTranscribing || isRecording ? <Square size={16} /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </form>
      <p className="text-xs text-gray-400 mt-1 text-center">ChatGPT can make mistakes. Check important info.</p>
      <FileViewerDialog 
        isOpen={!!selectedFile} 
        onClose={() => setSelectedFile(null)} 
        file={selectedFile}
      />
    </div>
  );
};

interface ChatAreaProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatArea({ sidebarOpen, onToggleSidebar }: ChatAreaProps) {
  const { getCurrentChat, addMessage, createNewChat, currentChatId, setMessage ,isEditorOpen , updateChatTitle , editingCode, setIsEditorOpen , setEditingCode , uploadedFiles,setUploadedFiles } = useChat();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentChat = getCurrentChat();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  useEffect(()=>{
    if(!currentChat){
      createNewChat();
    }
  },[]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && uploadedFiles.length==0) || isLoading) return;
  
    const userMessage = input.trim();
    const final_uploaded_files = uploadedFiles;
    setIsLoading(true);
    setInput("");
    setUploadedFiles([]);
  
    if (!currentChatId) {
      createNewChat();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  
    let uploaded_content = "<uploaded_content>\n";
    let image_num = 0;
    let file_num = 0;
  
    // Ensure all uploaded file processing completes
    await Promise.all(
      final_uploaded_files.map(async (file) => {
        try {
          const response = await fetch("api/process-file", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: file.url, mimeType: file.mimeType }),
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const content = await response.text();
          if (file.mimeType.startsWith("image/")) {
            uploaded_content += `Uploaded image ${++image_num}: `;
          } else {
            uploaded_content += `Uploaded file ${++file_num}: `;
          }
          uploaded_content += content + "\n";
        } catch (err) {
          console.error("Error processing file:", file, err);
        }
      })
    );
    uploaded_content+="</uploaded_content>\n";
    if(final_uploaded_files.length==0)
    {
      uploaded_content="";
    }
  
    const userMessageId = addMessage(uploaded_content+userMessage, "user", final_uploaded_files);
    const assistantMessageId = addMessage("", "assistant");
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...(getCurrentChat()?.messages || []), {
            role: "user",
            content: uploaded_content + userMessage,
          }],
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
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;
          setMessage(assistantMessageId, assistantMessage);
        }
      }
  
      if (!assistantMessage) {
        setMessage(assistantMessageId, "I apologize, but I encountered an error processing your request.");
      }
  
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
          });
  
          if (!titleResponse.ok) throw new Error(`HTTP error! status: ${titleResponse.status}`);
  
          const titleReader = titleResponse.body?.getReader();
          const titleDecoder = new TextDecoder();
          let newTitle = "";
  
          if (titleReader) {
            while (true) {
              const { done, value } = await titleReader.read();
              if (done) break;
  
              const chunk = titleDecoder.decode(value, { stream: true });
              newTitle += chunk;
              const cleanTitle = newTitle.replace(/["']/g, "").trim();
              updateChatTitle(currentChatId!, cleanTitle);
            }
          }
        } catch (error) {
          console.error("Title generation error:", error);
        }
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

  const handleSaveCode = async (code: string) => {
    if (!editingCode) return;

    // Add the code as a user message with special formatting
    const userMessageId = addMessage(`\`\`\`${editingCode.language}\n${code}\n\`\`\``, "user",[],"code");
    const assistantMessageId = addMessage("", "assistant");
    setIsLoading(true)
    try {
      // Send code for analysis
      const response = await fetch("/api/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language: editingCode.language }),
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
    }
    finally{
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white " style={{ backgroundColor: "rgb(32,32,33)" }}>
      {/* Header */}
      <div
        className="border-b border-gray-600 p-4 flex items-center justify-between"
        style={{ backgroundColor: "rgb(32,32,33)", borderColor: "rgb(64,64,64)" }}
      >
        <div className="flex items-center gap-3">
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

      {/* Messages or Centered Agenda */}
      {currentChat?.messages.length === 0 || !currentChat ? (
        <div className={`flex-1 flex flex-col justify-center ${isEditorOpen?"mr-10":"w-full"}  h-full px-4 `}>
          <div className={`text-center  ${isEditorOpen?"":"w-full max-w-3xl mx-auto"}   `}>
            <h2 className={`text-3xl ${isEditorOpen?"w-1/2":""}  font-semibold text-white mb-6`}>What's today's agenda?</h2>
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
            <div className={`space-y-6 py-6 max-w-3xl ${!isEditorOpen ? "w-full mx-auto" : "w-1/2"}`}>
              {currentChat.messages.map((message: Message) => (
                <MessageComponent key={message.id} message={message} onToggleSideBar={onToggleSidebar} sidebarOpen={sidebarOpen} />
              ))}
              {isLoading && (
                <MessageComponent
                  message={{
                    id: "loading",
                    role: "assistant",
                    content: "",
                    uploads:[],
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

      {/* Code Editor - Moved outside chat-specific section */}
      {isEditorOpen && editingCode && (
        <CodeEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingCode(null);
          }}
          initialCode={editingCode.code}
          language={editingCode.language}
          onSave={handleSaveCode}
        />
      )}
    </div>
  );
}
