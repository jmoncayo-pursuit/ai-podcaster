import { convertTextToSpeech, VoiceId } from './speechify';
import { concatAudioFiles } from './concatAudio';
import fs from 'fs';
import path from 'path';

export interface ConversationTurn {
  speaker: string;
  text: string;
  voiceId: VoiceId;
}

/**
 * Orchestrates a podcast-style conversation between multiple speakers.
 */
export async function generateConversationPodcast(
  conversation: ConversationTurn[],
  outputFile: string,
  audioFormat: 'mp3' | 'wav' = 'mp3'
): Promise<void> {
  const tempFiles: string[] = [];
  try {
    for (let i = 0; i < conversation.length; i++) {
      const turn = conversation[i];
      const audioBuffer = await convertTextToSpeech(turn.text, {
        input: turn.text,
        voiceId: turn.voiceId,
        audioFormat,
      });
      const tempFile = path.join(
        path.dirname(outputFile),
        `turn_${i + 1}.${audioFormat}`
      );
      fs.writeFileSync(tempFile, audioBuffer);
      tempFiles.push(tempFile);
    }
    await concatAudioFiles(tempFiles, outputFile);
  } finally {
    for (const file of tempFiles) {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
}

// Example usage for CLI/testing
if (require.main === module) {
  const conversation: ConversationTurn[] = [
    {
      speaker: 'Lisa',
      text: 'Hi George, how are you today?',
      voiceId: 'lisa',
    },
    {
      speaker: 'George',
      text: 'Hello Lisa! I am doing well, thank you. How about you?',
      voiceId: 'george',
    },
    {
      speaker: 'Lisa',
      text: 'I am great! Ready to record our podcast episode?',
      voiceId: 'lisa',
    },
    {
      speaker: 'George',
      text: 'Absolutely! Let’s get started.',
      voiceId: 'george',
    },
  ];
  generateConversationPodcast(
    conversation,
    path.join(__dirname, '../output.mp3'),
    'mp3'
  )
    .then(() =>
      console.log('Conversation audio created as output.mp3')
    )
    .catch(console.error);
}
