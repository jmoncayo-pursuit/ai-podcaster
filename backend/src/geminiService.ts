import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { EMOTIONS } from './emotions';
import { VOICES } from './voices';
dotenv.config();

export interface ConversationTurn {
  speaker: string;
  text: string;
  voiceId: string;
  emotion: string;
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

  const emotionList = EMOTIONS.join(', ');
  const voiceIdList = VOICES.map((v) => v.id).join(', ');
  const prompt = `Generate a podcast-style conversation on the following topic or content.

Input: ${input}

Requirements:
- Number of turns: ${turns}
- Number of speakers: ${speakers}
- Length limit: ${length} characters total.
- For each turn, set an appropriate emotion from this finite list: [${emotionList}] or use 'None' for neutral sentences, and include it as an 'emotion' field. The 'emotion' field must always be present and set to either a valid emotion or 'None'. Do not omit the 'emotion' field for any turn.
- For each speaker, assign a unique speaker name and a valid voiceId from this finite list: [${voiceIdList}]. Only use these values for voiceId. Use a different voiceId for each speaker if possible.
- Output as a JSON array of objects: [{speaker, text, voiceId, emotion}].
- Example output:
[
  {"speaker": "Lisa", "text": "Hi George, how are you today?", "voiceId": "lisa", "emotion": "cheerful"},
  {"speaker": "George", "text": "I'm fine, thanks Lisa!", "voiceId": "george", "emotion": "None"}
]
- Use realistic, natural dialogue.`;

  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
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

  // Post-process: filter/replace invalid emotions and voiceIds
  const validEmotions = new Set(EMOTIONS.concat('None'));
  const validVoiceIds = new Set(VOICES.map((v) => v.id));
  const defaultVoiceId = VOICES[0]?.id || 'lisa';
  conversation = conversation.map((turn) => ({
    ...turn,
    emotion: validEmotions.has(turn.emotion) ? turn.emotion : 'None',
    voiceId: validVoiceIds.has(turn.voiceId)
      ? turn.voiceId
      : defaultVoiceId,
  }));

  if (!Array.isArray(conversation) || conversation.length === 0) {
    throw new Error(
      'Failed to generate valid conversation structure'
    );
  }

  return conversation;
}
