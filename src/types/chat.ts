export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  uploads: { url: string, mimeType: string, uuid: string }[];
  timestamp: Date;
  messageType?: 'code' | 'chat';
}

export interface Chat {
  _id?: string; // MongoDB ID (optional for local storage)
  id: string; // Local ID for local storage
  userId?: string; // Optional for local storage
  title: string;
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
} 