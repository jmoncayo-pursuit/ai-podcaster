import express from 'express';
import cors from 'cors';
import { convertTextToSpeech } from './speechify';
import {
  generateConversationPodcast,
  ConversationTurn,
} from './conversationWorkflow';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

import type { Request, Response } from 'express';

app.post('/api/tts', (req, res) => {
  (async () => {
    const { text, voiceId, audioFormat } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res
        .status(400)
        .json({ error: 'Missing or invalid text' });
    }
    try {
      const audioBuffer = await convertTextToSpeech(text, {
        input: text,
        voiceId,
        audioFormat,
      });
      res.set('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  })();
});

app.post('/api/conversation', async (req: Request, res: Response) => {
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
  try {
    const outputFile = path.join(__dirname, '../../output.mp3');
    await generateConversationPodcast(
      conversation as ConversationTurn[],
      outputFile,
      audioFormat || 'mp3'
    );
    res.set('Content-Type', 'audio/mpeg');
    res.sendFile(path.resolve(outputFile), (err: Error) => {
      require('fs').unlink(outputFile, () => {});
      if (err && !res.headersSent) {
        res.status(500).json({ error: 'Failed to send audio file' });
      }
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`TTS API server listening on http://localhost:${PORT}`);
});

export default app;
