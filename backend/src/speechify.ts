import { Speechify } from '@speechify/api-sdk';
import 'dotenv/config';
import { VoiceId } from './types'; // Import VoiceId from types.ts
import stream from 'stream';

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

export interface TTSOptions {
  input: string;
  voiceId?: VoiceId;
  audioFormat?: 'mp3' | 'wav' | 'ogg' | 'aac';
}

export interface TTSGenerator {
  convertTextToSpeech(
    text: string,
    options?: TTSOptions
  ): Promise<Buffer>;
}

export async function convertTextToSpeech(
  text: string,
  options?: Omit<TTSOptions, 'input'> // Use Omit here as well for consistency
): Promise<Buffer> {
  const voiceId: VoiceId = options?.voiceId || 'monica';
  const audioFormat = options?.audioFormat || 'mp3';
  const chunks = chunkText(text, CHAR_LIMIT);
  const audioBuffers: Buffer[] = [];

  if (process.env.NODE_ENV !== 'production') {
    console.log('Converting text to speech with options:', {
      text,
      voiceId,
      audioFormat,
      chunks: chunks.length,
    });
  }

  for (const chunk of chunks) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Sending chunk to Speechify API:', chunk);
      }
      const response = await speechify.audioGenerate({
        input: chunk,
        voiceId,
        audioFormat,
      });
      const arrayBuffer = await response.audioData.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
      if (process.env.NODE_ENV !== 'production') {
        console.log('Chunk processed successfully');
      }
    } catch (error) {
      console.error('Error processing chunk:', error);
      throw new Error(
        `Speechify API Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return Buffer.concat(audioBuffers);
}

// --- Streaming TTS using Speechify's official streaming endpoint ---
export async function streamTextToSpeech(
  text: string,
  options?: Omit<TTSOptions, 'input'>,
  res?: any // Express response
): Promise<void> {
  if (!res)
    throw new Error('Express response object required for streaming');
  const voiceId: VoiceId = options?.voiceId || 'monica';
  // Only allow supported streaming formats
  let audioFormat: 'mp3' | 'ogg' | 'aac' = 'mp3';
  if (
    options?.audioFormat === 'ogg' ||
    options?.audioFormat === 'aac'
  ) {
    audioFormat = options.audioFormat;
  }
  try {
    const streamResponse = await speechify.audioStream({
      input: text,
      voiceId,
      audioFormat,
    });
    res.set('Content-Type', 'audio/mpeg');
    res.set('Transfer-Encoding', 'chunked');
    // Convert Web ReadableStream to Node.js Readable and pipe
    const nodeStream = stream.Readable.fromWeb(streamResponse as any);
    nodeStream.pipe(res);
  } catch (error) {
    console.error('Speechify streaming error:', error);
    if (!res.headersSent)
      res.status(500).json({ error: 'Speechify streaming failed' });
  }
}
