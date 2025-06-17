"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/components/chat-provider"
import {Input} from "@/components/ui/input"
import {
  PenSquare,
  Search,
  BookOpen,
  Play,
  Grid3X3,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit3,
  Crown,
  PanelLeftClose,
  Sparkles,
  Loader2,
  Check,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { chats, currentChatId, createNewChat, selectChat, deleteChat, isEditorOpen, isLoading, updateChatTitle } = useChat()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (isEditorOpen) {
          onToggle()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onToggle, isEditorOpen])

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const handleRename = (chatId: string) => {
    const chat = chats.find(c => c._id === chatId)
    if (chat) {
      setEditingTitle(chat.title)
      setEditingId(chatId)
    }
  }

  const handleSaveRename = () => {
    if (editingId && editingTitle.trim()) {
      updateChatTitle(editingId, editingTitle.trim())
      setEditingId(null)
      setEditingTitle("")
    }
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename()
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      ref={sidebarRef}
      className={`w-64 flex flex-col h-full bg-gray-50 dark:bg-gray-900 ${isEditorOpen ? "fixed inset-y-0 left-0 z-50" : ""}`} 
      style={{ backgroundColor: "rgb(22,22,23)" }}
    >
      {/* Fixed Header */}
      <div className="p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Sparkles size={14} className="text-gray-900" />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-1 h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <PanelLeftClose size={16} />
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1 min-h-0 sidebar-scroll">
        <div className="flex flex-col">
          {/* Main Navigation */}
          <div className="p-3 space-y-1">
            <Button
              onClick={createNewChat}
              className="w-full bg-transparent hover:bg-gray-700 text-white justify-start gap-3 h-10 px-3 border-0"
            >
              <PenSquare size={16} className="text-white" />
              <span className="text-white">New chat</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full text-gray-300 hover:bg-gray-700 hover:text-white justify-start gap-3 h-10 px-3"
            >
              <Search size={16} className="text-gray-300" />
              <span className="text-gray-300">Search chats</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full text-gray-300 hover:bg-gray-700 hover:text-white justify-start gap-3 h-10 px-3"
            >
              <BookOpen size={16} className="text-gray-300" />
              <span className="text-gray-300">Library</span>
            </Button>
          </div>

          {/* Secondary Navigation */}
          <div className="px-3 py-2">
            <Button
              variant="ghost"
              className="w-full text-gray-300 hover:bg-gray-700 hover:text-white justify-start gap-3 h-10 px-3"
            >
              <Play size={16} className="text-gray-300" />
              <span className="text-gray-300">Sora</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full text-gray-300 hover:bg-gray-700 hover:text-white justify-start gap-3 h-10 px-3"
            >
              <Grid3X3 size={16} className="text-gray-300" />
              <span className="text-gray-300">GPTs</span>
            </Button>
          </div>

          {/* Chat History */}
          <div className="px-3">
            <div className="py-3">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Chats</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                </div>
              ) : chats.length === 0 ? (
                <div className="text-gray-500 text-sm py-4 text-center">No chats yet</div>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div
                      key={chat._id}
                      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 ${
                        currentChatId === chat._id ? "bg-gray-700" : ""
                      }`}
                      onClick={() => selectChat(chat._id)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {editingId === chat._id ? (
                          <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                            <Input
                              ref={inputRef}
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="h-6 text-sm bg-gray-800 border-gray-700 text-white focus:ring-0 focus-visible:ring-0"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-green-400 hover:text-green-300 hover:bg-gray-600"
                              onClick={handleSaveRename}
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-gray-600"
                              onClick={handleCancelRename}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <span className="truncate text-gray-200 max-w-[180px]">
                            {chat.title}
                          </span>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal size={12} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 bg-gray-800 border-gray-600">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(chat._id);
                              }}
                              className="text-gray-200 focus:bg-gray-700 focus:text-white"
                            >
                              <Edit3 size={12} className="mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(chat._id);
                              }}
                              className="text-red-400 focus:bg-red-600 focus:text-white"
                            >
                              <Trash2 size={12} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Fixed Upgrade Plan Footer */}
      <div className="p-3 shrink-0">
        <Button
          variant="ghost"
          className="w-full text-gray-300 hover:bg-gray-700 hover:text-white justify-start gap-3 h-10 px-3"
        >
          <Crown size={16} className="text-gray-300" />
          <div className="flex flex-col items-start">
            <span className="text-sm text-gray-300">Upgrade plan</span>
            <span className="text-xs text-gray-500">More access to the best models</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
