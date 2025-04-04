export interface Message {
  isUser: boolean;
  text: string;
  audio?: string | null;
} 