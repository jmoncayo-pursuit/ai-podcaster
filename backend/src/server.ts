import express from 'express';
import cors from 'cors';
import { convertTextToSpeech } from './speechify';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

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

app.listen(PORT, () => {
  console.log(`TTS API server listening on http://localhost:${PORT}`);
});

export default app;
