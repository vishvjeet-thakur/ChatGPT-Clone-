export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  uploads: { url: string, mimeType: string, uuid: string }[];
  timestamp: Date;
  messageType?: 'code' | 'chat';
}

export interface Chat {
  _id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
} 