import { Message } from '@/app/types/chat';

const CHAT_HISTORY_KEY = 'cyrene_chat_history';

export const ChatStorage = {
  saveMessages: (messages: Message[]) => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  },

  loadMessages: (): Message[] => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  },

  clearHistory: () => {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }
}; 