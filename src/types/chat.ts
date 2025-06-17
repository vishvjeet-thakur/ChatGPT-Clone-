export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  uploads: { url: string, mimeType: string, uuid: string }[]
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
} 