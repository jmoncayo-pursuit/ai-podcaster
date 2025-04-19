import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export interface ConversationTurn {
  speaker: string;
  text: string;
  voiceId: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

/**
 * Checks if the Gemini AI instance is available
 */
export function isGeminiAvailable(): boolean {
  return !!genAI;
}

/**
 * Generates a podcast-style conversation using Gemini AI
 *
 * @param input - The topic or content prompt
 * @param options - Configuration options (turns, speakers, length)
 * @returns Promise resolving to an array of conversation turns
 */
export async function generateAIConversation(
  input: string,
  options: { turns?: number; speakers?: number; length?: number } = {}
): Promise<ConversationTurn[]> {
  if (!genAI) {
    throw new Error('Gemini API key not set');
  }

  const { turns = 4, speakers = 2, length = 600 } = options;

  const prompt = `Generate a podcast-style conversation on the following topic or content.

Input: ${input}

Requirements:
- Number of turns: ${turns}
- Number of speakers: ${speakers}
- Length limit: ${length} characters total.
- Output as a JSON array of objects: [{speaker, text, voiceId}].
- Use realistic, natural dialogue.
- Assign a unique speaker name and a suitable voiceId (e.g., 'lisa', 'george', etc.).`;

  const response = await genAI.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
  });

  const text = response.text || '';
  let conversation: ConversationTurn[] = [];

  try {
    const match = text.match(/\[[\s\S]*\]/);
    conversation = match ? JSON.parse(match[0]) : [];
  } catch (err) {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  if (!Array.isArray(conversation) || conversation.length === 0) {
    throw new Error(
      'Failed to generate valid conversation structure'
    );
  }

  return conversation;
}
