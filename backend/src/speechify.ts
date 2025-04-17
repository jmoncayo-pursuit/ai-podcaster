import { Speechify } from '@speechify/api-sdk';
import 'dotenv/config';

const API_KEY = process.env.SPEECHIFY_API_KEY;
// Speechify /speech endpoint: 2,000 char limit (including SSML)
const CHAR_LIMIT = 2000;

if (!API_KEY) throw new Error('SPEECHIFY_API_KEY not set');

const speechify = new Speechify({ apiKey: API_KEY });

function chunkText(text: string, limit: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + limit));
    i += limit;
  }
  return chunks;
}

export type VoiceId = 'george' | 'rob' | 'monica';

export interface TTSOptions {
  input: string;
  voiceId?: VoiceId;
  audioFormat?: 'mp3' | 'wav';
}

export interface TTSGenerator {
  convertTextToSpeech(
    text: string,
    options?: TTSOptions
  ): Promise<Buffer>;
}

export async function convertTextToSpeech(
  text: string,
  options?: TTSOptions
): Promise<Buffer> {
  const voiceId: VoiceId = options?.voiceId || 'monica';
  const audioFormat = options?.audioFormat || 'mp3';
  const chunks = chunkText(text, CHAR_LIMIT);
  const audioBuffers: Buffer[] = [];
  for (const chunk of chunks) {
    const response = await speechify.audioGenerate({
      input: chunk,
      voiceId,
      audioFormat,
    });
    const arrayBuffer = await response.audioData.arrayBuffer();
    audioBuffers.push(Buffer.from(arrayBuffer));
  }
  return Buffer.concat(audioBuffers);
}
