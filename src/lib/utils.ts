import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Chat } from "@/types/chat"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Local storage utilities for chats
const CHATS_STORAGE_KEY = 'local_chats'

export function saveChatsToLocalStorage(chats: Chat[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats))
  }
}

export function loadChatsFromLocalStorage(): Chat[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CHATS_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Error parsing stored chats:', error)
      }
    }
  }
  return []
}

export function clearLocalChats() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHATS_STORAGE_KEY)
  }
}
