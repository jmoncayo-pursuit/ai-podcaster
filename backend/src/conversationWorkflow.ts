import { convertTextToSpeech, TTSOptions } from './speechify';
import { concatAudioFiles } from './concatAudio';
import { VOICES } from './voices';
import { VoiceId } from './types';
import fs from 'fs';
import path from 'path';

export interface ConversationTurn {
  speaker: string;
  text: string;
  voiceId: string;
  emotion?: string;
}

// Define an interface for the voice object matching voices.ts
interface Voice {
  id: string;
  label: string;
  gender: string;
}

const validVoiceIds = new Set(VOICES.map((v: Voice) => v.id)); // Add type annotation for 'v'
const DEFAULT_VOICE_ID: VoiceId = 'lisa';

// Map each unique speaker to a unique, valid voiceId
function assignUniqueVoices(
  conversation: ConversationTurn[]
): ConversationTurn[] {
  // Get all available voice IDs
  const availableVoiceIds = VOICES.map((v: Voice) => v.id);
  const speakerToVoice: Record<string, string> = {};
  let voiceIdx = 0;

  for (const turn of conversation) {
    const speaker = turn.speaker?.trim() || 'Unknown Speaker';
    if (!speakerToVoice[speaker]) {
      // Find the next unused voiceId
      while (
        voiceIdx < availableVoiceIds.length &&
        Object.values(speakerToVoice).includes(
          availableVoiceIds[voiceIdx]
        )
      ) {
        voiceIdx++;
      }
      // Assign a voiceId, fallback to default if out of voices
      speakerToVoice[speaker] =
        availableVoiceIds[voiceIdx] || DEFAULT_VOICE_ID;
      voiceIdx++;
    }
  }

  // Return a new conversation array with updated voiceIds
  return conversation.map((turn) => ({
    ...turn,
    voiceId: validVoiceIds.has(turn.voiceId)
      ? turn.voiceId
      : speakerToVoice[turn.speaker?.trim() || ''] ||
        DEFAULT_VOICE_ID,
  }));
}

/**
 * Generates a podcast-style conversation audio file from turns
 *
 * @param conversation - Array of conversation turns
 * @param outputFile - Path to save the final audio file
 * @param audioFormat - Desired audio format (e.g., 'mp3')
 * @returns Promise resolving when the audio file is generated
 */
export async function generateConversationPodcast(
  conversation: ConversationTurn[],
  outputFile: string,
  audioFormat: 'mp3' | 'wav' = 'mp3'
): Promise<void> {
  // Ensure each speaker is mapped to a unique, valid voiceId
  const updatedConversation = assignUniqueVoices(conversation);
  const audioFiles: string[] = [];

  try {
    for (let i = 0; i < updatedConversation.length; i++) {
      const turn = updatedConversation[i];
      const tempFile = path.join(
        __dirname,
        `temp_audio_${i}.${audioFormat}`
      );

      // Validate voiceId and use default if invalid
      let voiceIdToUse: VoiceId = DEFAULT_VOICE_ID;
      if (validVoiceIds.has(turn.voiceId)) {
        voiceIdToUse = turn.voiceId as VoiceId; // Cast to VoiceId after validation
      } else {
        console.warn(
          `Invalid voiceId "${turn.voiceId}" for turn ${i}. Using default "${DEFAULT_VOICE_ID}".`
        );
      }

      // Prepare text with emotion SSML if emotion is set and not 'None'
      let textToSynthesize = turn.text;
      // Replace *word* with <emphasis>word</emphasis> for TTS emphasis
      textToSynthesize = textToSynthesize.replace(
        /\*([^*]+)\*/g,
        '<emphasis>$1</emphasis>'
      );
      // If the text is only '...', replace with a medium SSML pause
      if (textToSynthesize.trim() === '...') {
        textToSynthesize = '<speak><break time="900ms"/></speak>';
      } else if (
        turn.emotion &&
        typeof turn.emotion === 'string' &&
        turn.emotion.trim() &&
        turn.emotion !== 'None'
      ) {
        textToSynthesize = `<speak><speechify:style emotion="${turn.emotion}">${textToSynthesize}</speechify:style></speak>`;
      }

      // Prepare options for convertTextToSpeech, excluding the 'input' property
      const options: Omit<TTSOptions, 'input'> = {
        voiceId: voiceIdToUse,
        audioFormat,
      };

      // Pass text as the first argument and options as the second
      const audioBuffer = await convertTextToSpeech(
        textToSynthesize,
        options
      );

      await fs.promises.writeFile(tempFile, audioBuffer);
      audioFiles.push(tempFile);
    }

    await concatAudioFiles(audioFiles, outputFile);
  } catch (error) {
    console.error('Error generating conversation podcast:', error);
    throw error; // Re-throw the error to be caught by the API handler
  } finally {
    // Clean up temporary audio files
    for (const file of audioFiles) {
      try {
        await fs.promises.unlink(file);
      } catch (cleanupError) {
        console.error(
          `Error deleting temporary file ${file}:`,
          cleanupError
        );
      }
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
