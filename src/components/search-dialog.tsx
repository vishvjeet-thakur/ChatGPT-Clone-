import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"
import { useChat } from "./chat-provider"

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const { chats, selectChat } = useChat()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredChats, setFilteredChats] = useState(chats)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = chats.filter(chat => {
      // Check if title matches
      if (chat.title.toLowerCase().includes(query)) {
        return true
      }

      // Check if any message content matches
      return chat.messages.some(msg => 
        msg.content.toLowerCase().includes(query)
      )
    })

    setFilteredChats(filtered)
  }, [searchQuery, chats])

  const handleChatSelect = (chatId: string) => {
    selectChat(chatId)
    onClose()
    setSearchQuery("") // Clear search when closing
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] p-0 bg-[rgb(46,47,46)] border-gray-700  ">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Search Chats</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats and messages..."
                className="pl-10 bg-[rgb(46,47,46)] border-gray-700 text-white placeholder:text-gray-400"
                autoFocus
              />
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 pb-4">
              {filteredChats.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  No chats found
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleChatSelect(chat.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-[rgb(81,83,81)] transition-colors"
                  >
                    <div className="text-white font-medium">{chat.title}</div>
                    {chat.messages.length > 0 && (
                      <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {chat.messages[chat.messages.length - 1].content}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 