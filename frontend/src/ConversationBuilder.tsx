import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { EMOTIONS } from './emotions.js';

interface ConversationTurn {
  speaker: string;
  text: string;
  voiceId: string;
  emotion?: string;
}

interface ConversationBuilderProps {
  voices: { id: string; label: string; gender: string }[];
  apiUrl: string;
  initialTurns?: ConversationTurn[];
}

const ConversationBuilder: React.FC<ConversationBuilderProps> = ({
  voices,
  apiUrl,
  initialTurns,
}) => {
  const [turns, setTurns] = useState<ConversationTurn[]>([
    {
      speaker: '',
      text: '',
      voiceId: voices[0]?.id || '',
      emotion: '',
    },
  ]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTurns && initialTurns.length > 0) {
      const validatedTurns = initialTurns.map((turn) => {
        const match = voices.find(
          (v) => v.label.toLowerCase() === turn.speaker.toLowerCase()
        );
        return {
          speaker: turn.speaker || '',
          text: turn.text || '',
          voiceId: match?.id || voices[0]?.id || '',
          emotion: turn.emotion || '',
        };
      });
      setTurns(validatedTurns);
    }
  }, [initialTurns, voices]);

  const handleTurnChange = (
    idx: number,
    field: keyof ConversationTurn,
    value: string
  ) => {
    setTurns((prev) =>
      prev.map((turn, i) =>
        i === idx ? { ...turn, [field]: value } : turn
      )
    );
  };

  const addTurn = () =>
    setTurns((prev) => [
      ...prev,
      {
        speaker: '',
        text: '',
        voiceId: voices[0]?.id || '',
        emotion: '',
      },
    ]);
  const removeTurn = (idx: number) =>
    setTurns((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    for (const turn of turns) {
      if (!turn.text.trim()) return 'Each turn must have text.';
      if (!turn.voiceId) return 'Each turn must have a voice.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStatus('loading');
    setAudioUrl(null);
    const turnsToSend = turns.map((turn) => ({
      ...turn,
      speaker:
        turn.speaker.trim() ||
        voices.find((v) => v.id === turn.voiceId)?.label ||
        '',
    }));
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: turnsToSend,
          audioFormat: 'mp3',
        }),
      });
      if (!res.ok) throw new Error('Conversation TTS failed');
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
      setStatus('done');
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {turns.map((turn, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#181A20',
            borderRadius: 2,
            p: 1.25,
            mb: 0.75,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1.5,
              alignItems: 'center',
              mb: 1,
            }}
          >
            <FormControl sx={{ minWidth: 120 }} size='small'>
              <InputLabel>Voice</InputLabel>
              <Select
                value={turn.voiceId}
                label='Voice'
                onChange={(e) =>
                  handleTurnChange(idx, 'voiceId', e.target.value)
                }
                required
              >
                {voices.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label='Speaker (optional)'
              value={turn.speaker}
              onChange={(e) =>
                handleTurnChange(idx, 'speaker', e.target.value)
              }
              sx={{ width: 120 }}
              size='small'
              placeholder={
                voices.find((v) => v.id === turn.voiceId)?.label || ''
              }
            />
            <FormControl sx={{ minWidth: 100 }} size='small'>
              <InputLabel>Emotion</InputLabel>
              <Select
                value={turn.emotion || ''}
                label='Emotion'
                onChange={(e) =>
                  handleTurnChange(idx, 'emotion', e.target.value)
                }
              >
                <MenuItem value=''>None</MenuItem>
                {EMOTIONS.map((emotion: string) => (
                  <MenuItem key={emotion} value={emotion}>
                    {emotion.charAt(0).toUpperCase() +
                      emotion.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              type='button'
              onClick={() => removeTurn(idx)}
              disabled={turns.length === 1}
              color='error'
              sx={{ ml: 1 }}
              aria-label='Remove turn'
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            label='Text'
            value={turn.text}
            onChange={(e) =>
              handleTurnChange(idx, 'text', e.target.value)
            }
            required
            multiline
            minRows={3}
            maxRows={8}
            sx={{ width: '100%' }}
            size='small'
          />
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          type='button'
          onClick={addTurn}
          color='secondary'
          variant='contained'
        >
          Add Turn
        </Button>
        <Button
          type='submit'
          disabled={status === 'loading'}
          color='primary'
          variant='contained'
          sx={{ ml: 'auto', minWidth: 180 }}
        >
          {status === 'loading'
            ? 'Generating...'
            : 'Generate Conversation Audio'}
        </Button>
      </Box>
      {error && (
        <Alert severity='error' sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      {status === 'done' && audioUrl && (
        <Box sx={{ mt: 2 }}>
          <audio controls src={audioUrl} style={{ width: '100%' }} />
        </Box>
      )}
    </form>
  );
};

export default ConversationBuilder;
