// utils/openaiUtils.ts
import axios from 'axios';

export const generateCharacterInfo = async (oneLiner: string, description: string): Promise<{ bio: string, lore: string, knowledge: string }> => {
  try {
    const response = await axios.post('/api/generateCharacterInfo', {
      oneLiner,
      description,
    });

    return response.data;
  } catch (error) {
    console.error('Error generating character info:', error);
    throw error;
  }
};