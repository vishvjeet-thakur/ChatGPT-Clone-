"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"
import { ChatProvider } from "@/components/chat-provider"

export default function ChatGPTClone() {
  const [sidebarOpen, setSidebarOpen  ] = useState(true)

  return (
    <ChatProvider>
      <div className="flex h-screen bg-white dark:bg-gray-800">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <ChatArea sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>
    </ChatProvider>
  )
}
