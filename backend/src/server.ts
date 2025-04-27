import express, { RequestHandler } from 'express'; // Remove unused Request, Response
import cors from 'cors';
import { convertTextToSpeech, TTSOptions } from './speechify'; // Import TTSOptions
import {
  generateConversationPodcast,
  ConversationTurn,
} from './conversationWorkflow';
import {
  isGeminiAvailable,
  generateAIConversation,
} from './geminiService';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Define route handlers with the RequestHandler type and avoid returning responses
const handleTTS: RequestHandler = (req, res) => {
  const { text, voiceId, audioFormat } = req.body || {};
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Missing or invalid text' });
    return;
  }

  // Always wrap text in SSML with direct emotion for single speaker mode
  // Sanitize ellipses: replace ... with <break time="500ms"/> or a period
  let sanitized = text.replace(/\.{3,}/g, '<break time="500ms"/>');
  // Ensure each sentence ends with strong punctuation
  sanitized = sanitized.replace(/([^.!?…])\s*$/gm, '$1.');
  const ssml = `<speak><speechify:style emotion="direct">${sanitized}</speechify:style></speak>`;

  const options: Omit<TTSOptions, 'input'> = {
    voiceId,
    audioFormat,
  };

  // Pass SSML as the first argument and options as the second
  convertTextToSpeech(ssml, options)
    .then((audioBuffer) => {
      res.set('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
    })
    .catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(500).json({ error: msg });
    });
};

const handleConversation: RequestHandler = async (req, res) => {
  console.log(
    'Conversation request received:',
    req.body?.conversation?.length,
    'turns'
  );

  const { conversation, audioFormat } = req.body || {};
  if (!Array.isArray(conversation) || conversation.length === 0) {
    res
      .status(400)
      .json({ error: 'Missing or invalid conversation array' });
    return;
  }

  for (const turn of conversation) {
    if (
      !turn ||
      typeof turn.text !== 'string' ||
      typeof turn.voiceId !== 'string'
    ) {
      res
        .status(400)
        .json({ error: 'Each turn must have text and voiceId' });
      return;
    }
  }

  // If only one unique voiceId, stream TTS audio directly (even if multiple turns)
  const uniqueVoiceIds = Array.from(
    new Set(conversation.map((t) => t.voiceId?.trim()))
  );
  if (uniqueVoiceIds.length === 1) {
    try {
      console.log(
        '[TTS] Streaming single-voiceId multi-turn conversation as one SSML stream'
      );
      // Build SSML with emotion for each turn
      const SUPPORTED_EMOTIONS = [
        'angry',
        'cheerful',
        'sad',
        'terrified',
        'relaxed',
        'fearful',
        'assertive',
        'energetic',
        'warm',
        'direct',
        'bright',
      ];
      const DEFAULT_EMOTION = 'direct';
      const sanitizeEllipses = (txt: string) =>
        txt.replace(/\.{3,}/g, '<break time="500ms"/>');
      const ssml =
        `<speak>` +
        conversation
          .map((turn) => {
            let text = sanitizeEllipses(turn.text.trim());
            if (text && !/[.!?…]$/.test(text)) text += '.';
            text = text.replace(/\s+/g, ' ');
            if (
              turn.emotion &&
              SUPPORTED_EMOTIONS.includes(turn.emotion)
            ) {
              return `<speechify:style emotion="${turn.emotion}">${text}</speechify:style>`;
            } else {
              return `<speechify:style emotion="${DEFAULT_EMOTION}">${text}</speechify:style>`;
            }
          })
          .join(' ') +
        `</speak>`;
      // Log the generated SSML for debugging
      console.log('[TTS] Generated SSML:', ssml);
      const options = {
        voiceId: uniqueVoiceIds[0],
        audioFormat: audioFormat || 'mp3',
      };
      await require('./speechify').streamTextToSpeech(
        ssml,
        options,
        res
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(
        'Error streaming single-voiceId multi-turn TTS:',
        msg
      );
      if (!res.headersSent) res.status(500).json({ error: msg });
    }
    return;
  }

  const outputFile = path.join(__dirname, '../../output.mp3');
  generateConversationPodcast(
    conversation as ConversationTurn[],
    outputFile,
    audioFormat || 'mp3'
  )
    .then(() => {
      console.log('Conversation podcast generated successfully');
      res.set('Content-Type', 'audio/mpeg');
      res.sendFile(path.resolve(outputFile), (err) => {
        require('fs').unlink(outputFile, () => {});
        if (err && !res.headersSent) {
          console.error('Error sending audio file:', err);
          res
            .status(500)
            .json({ error: 'Failed to send audio file' });
        }
      });
    })
    .catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Error generating conversation podcast:', msg);
      res.status(500).json({ error: msg });
    });
};

const handleAIConversation: RequestHandler = (req, res) => {
  console.log('AI conversation request received:', req.body);

  if (!isGeminiAvailable()) {
    console.error('Gemini API key not set or invalid');
    res.status(500).json({ error: 'Gemini API key not set' });
    return;
  }

  const { input, turns, speakers, length } = req.body || {};
  if (!input || typeof input !== 'string') {
    res.status(400).json({ error: 'Missing or invalid input' });
    return;
  }

  generateAIConversation(input, { turns, speakers, length })
    .then((conversation) => {
      console.log(
        'AI conversation generated successfully:',
        conversation.length,
        'turns'
      );
      res.json({ conversation });
    })
    .catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Error generating AI conversation:', msg);
      res.status(500).json({ error: msg || 'Gemini error' });
    });
};

// Register the handlers with their routes
app.post('/api/tts', handleTTS);
app.post('/api/conversation', handleConversation);
app.post('/api/ai-conversation', handleAIConversation);

app.listen(PORT, () => {
  console.log(`TTS API server listening on http://localhost:${PORT}`);
});

export default app;
