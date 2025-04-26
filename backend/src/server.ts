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

  // Prepare options without the 'input' property
  const options: Omit<TTSOptions, 'input'> = {
    voiceId,
    audioFormat,
  };

  // Pass text as the first argument and options as the second
  convertTextToSpeech(text, options)
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

  // If only one turn, stream TTS audio directly (no concat)
  if (conversation.length === 1) {
    try {
      const turn = conversation[0];
      const options: Omit<TTSOptions, 'input'> = {
        voiceId: turn.voiceId,
        audioFormat: audioFormat || 'mp3',
      };
      // Use Speechify's official streaming endpoint
      await require('./speechify').streamTextToSpeech(
        turn.text,
        options,
        res
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Error streaming single-turn TTS:', msg);
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
