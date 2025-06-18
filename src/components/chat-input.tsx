"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, Plus, X } from "lucide-react"
import { useChat } from "@/components/chat-provider"
import { VoiceRecorder } from "@/components/voice-recorder"
import { uploadFile } from "@uploadcare/upload-client"
import {
  deleteFile,
  UploadcareSimpleAuthSchema,
} from '@uploadcare/rest-client'
import { FileViewerDialog } from "@/components/file-viewer-dialog"

/**
 * Props interface for the ChatInput component
 * Defines the props required for the chat input functionality
 */
interface ChatInputProps {
  /** Whether the chat is currently loading/processing */
  isLoading: boolean
  /** Function to handle form submission with the input text */
  onSubmit: (inputText: string) => void
  /** Optional function to handle keyboard events */
  onKeyDown?: (e: React.KeyboardEvent) => void
}

/**
 * ChatInput Component
 * 
 * A comprehensive input component that handles:
 * - Text input with auto-resizing
 * - File uploads with preview and loading states
 * - Voice recording and transcription
 * - Real-time file processing
 * - Responsive design for different screen sizes
 * 
 * Features:
 * - Immediate file upload feedback with loading spinners
 * - Support for multiple file types (images, PDFs, documents)
 * - Voice recording with automatic transcription
 * - File preview with delete functionality
 * - File viewer dialog for viewing uploaded content
 * - Disabled states during processing
 * 
 * @param props - ChatInputProps containing input state and handlers
 * @returns JSX element representing the chat input interface
 */
export function ChatInput({ isLoading, onSubmit, onKeyDown }: ChatInputProps) {
  // Refs for DOM elements
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Chat context for global state
  const { isEditorOpen, isRecording, waveformRef, uploadedFiles, setUploadedFiles } = useChat()
  
  // Local state for component functionality
  const [input, setInput] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string, mimeType: string }[]>([])
  const [selectedFile, setSelectedFile] = useState<{ url: string, mimeType: string } | null>(null)

  /**
   * Auto-resize textarea based on content
   * Adjusts the height of the textarea as the user types
   * Maximum height is capped at 200px with scrolling
   */
  // useEffect(() => {
  //   const textarea = textareaRef.current
  //   if (textarea) {
  //     textarea.style.height = 'auto'
  //     const newHeight = Math.min(textarea.scrollHeight, 200)
  //     textarea.style.height = `${newHeight}px`
  //   }
  // }, [input])

  /**
   * Deletes an uploaded file from both Uploadcare CDN and local state
   * - Removes file from Uploadcare storage
   * - Updates local state to remove file from UI
   * - Handles errors gracefully with console logging
   * 
   * @param uuid - The unique identifier of the file to delete
   */
  const handleDeleteFile = async (uuid: string) => {
    try {
      // Initialize Uploadcare authentication
      const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
        publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_API_KEY || '',
        secretKey: process.env.NEXT_PUBLIC_UPLOADCARE_SECRET_KEY || '',
      })

      // Delete file from Uploadcare CDN
      await deleteFile(
        { uuid },
        { authSchema: uploadcareSimpleAuthSchema }
      )

      // Remove from local state
      setUploadedFiles(uploadedFiles.filter(file => file.uuid !== uuid))
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  /**
   * Handles file selection and upload process
   * - Shows immediate loading state for selected files
   * - Uploads files to Uploadcare CDN
   * - Updates state with uploaded file information
   * - Handles errors gracefully
   * - Clears file input after processing
   * 
   * @param e - File input change event
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Add files to uploading state immediately for visual feedback
    const newUploadingFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      mimeType: file.type
    }))
    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    const uploaded: { url: string, mimeType: string, uuid: string }[] = []

    // Process each file individually
    for (const file of Array.from(files)) {
      try {
        // Upload file to Uploadcare
        const result = await uploadFile(file, {
          publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_API_KEY || "",
          store: 'auto'
        })

        // Add successful upload to results
        uploaded.push({
          url: result.cdnUrl || "",
          mimeType: file.type,
          uuid: result.uuid || ""
        })
      } catch (err) {
        console.error("Upload failed", err)
      }
    }

    // Remove uploaded files from loading state
    setUploadingFiles(prev => prev.filter(f => !newUploadingFiles.find(nf => nf.id === f.id)))
    
    // Add uploaded files to global state
    setUploadedFiles([...uploadedFiles, ...uploaded])

    // Clear the file input for future uploads
    if (e.target) {
      e.target.value = ''
    }
  }

  /**
   * Handles voice recording completion and transcription
   * - Sends audio blob to transcription API
   * - Appends transcribed text to current input
   * - Handles errors gracefully
   * - Shows loading state during transcription
   * 
   * @param audioBlob - The recorded audio as a Blob
   */
  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    try {
      const formData = new FormData()
      // Create a File object with proper name and type
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })
      formData.append('audio', audioFile)

      console.log('Audio file type:', audioFile.type)
      console.log('Audio file size:', audioFile.size)

      // Send audio to transcription API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to transcribe audio: ${errorData.error || response.statusText}`)
      }

      const { text } = await response.json()
      const currentText = input.trim()
      const newText = text.trim()

      // Append transcribed text to current input
      setInput(
        // Add a space between existing text and new text if both exist
        currentText ? `${currentText} ${newText}` : newText
      )

    } catch (error) {
      console.error('Error transcribing audio:', error)
    } finally {
      setIsTranscribing(false)
    }
  }

  return (
    <div className={`max-w-3xl ${!isEditorOpen ? "mx-auto w-full" : "w-1/2"} pb-3`}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if ((!input.trim() && uploadedFiles.length == 0) || isLoading || isTranscribing || isRecording) return
          onSubmit(input.trim())
          setInput("")
          setUploadedFiles([])
        }}
        className="w-full rounded-3xl p-2 flex flex-col"
        style={{ backgroundColor: "rgb(49,48,49)", borderColor: "rgb(96,96,64)", maxHeight: "300px" }}
      >
        <div className="relative overflow-auto flex-1">
          {/* File Upload Preview Section */}
          <div className="flex flex-wrap mb-2 gap-2">
            {/* Loading State: Show uploading files with spinner */}
            {uploadingFiles.map((file) => (
              <div key={file.id} className="relative">
                {file.mimeType.startsWith("image/") ? (
                  // Image loading placeholder
                  <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  // Document loading placeholder
                  <div className="w-24 h-24 bg-gray-700 text-white rounded-lg flex items-center justify-center text-xs text-center p-2">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Uploaded Files: Show completed uploads with preview */}
            {uploadedFiles.map((file) => (
              <div key={file.uuid} className="relative">
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteFile(file.uuid)}
                  className="absolute top-1 right-1 bg-red-500 rounded-full text-white hover:bg-red-700 p-1"
                >
                  <X size={16} />
                </button>
                
                {/* File preview */}
                {file.mimeType.startsWith("image/") ? (
                  // Image preview
                  <img
                    src={file.url}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-lg border cursor-pointer transition-opacity"
                    onClick={() => setSelectedFile(file)}
                  />
                ) : (
                  // Document preview
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

          {/* Text Input or Waveform Section */}
          {!isRecording ? (
            // Text input area
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  // Submit the form
                  const form = e.currentTarget.closest('form')
                  if (form) {
                    form.requestSubmit()
                  }
                }
                // Call the parent onKeyDown if provided
                onKeyDown?.(e)
              }}
              placeholder="Message ChatGPT..."
              className="w-full resize-none bg-gray-800 text-white placeholder:text-gray-400 border-none focus:outline-none focus:ring-0 focus:border-none"
              style={{ minHeight: "40px", maxHeight: "200px", backgroundColor: "rgb(49,48,49)" }}
              disabled={isLoading || isTranscribing}
            />
          ) : (
            // Audio waveform display during recording
            <div id="waveform" ref={waveformRef} className="w-full resize-none bg-[rgb(49,48,49)] text-white placeholder:text-gray-400 border-none focus:outline-none focus:ring-0 focus:border-none" />
          )}
        </div>

        {/* Bottom Button Row */}
        <div className="flex items-center justify-between">
          {/* File Upload Button */}
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
          
          {/* Voice Recorder and Send Button */}
          <div className="flex items-center gap-2">
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              onCancel={() => setIsTranscribing(false)}
            />
            <Button
              type="submit"
              size="sm"
              disabled={(!input.trim() && uploadedFiles.length == 0) || isLoading || isTranscribing || isRecording}
              className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full"
            >
              {isLoading || isTranscribing || isRecording ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </form>

      {/* File Viewer Dialog */}
      <FileViewerDialog
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        file={selectedFile}
      />

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-1 text-center">ChatGPT can make mistakes. Check important info.</p>
    </div>
  )
} 