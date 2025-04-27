import React, { useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import Tooltip from '@mui/material/Tooltip';
import { EMOTIONS } from './emotions.js';
import CustomLoader from './CustomLoader';

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
  const [lastSubmittedTurns, setLastSubmittedTurns] = useState<
    ConversationTurn[] | null
  >(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>(
    'idle'
  );
  const playerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTurns && initialTurns.length > 0) {
      const validatedTurns = initialTurns.map((turn) => {
        // Use the provided voiceId if it's valid, otherwise try to match by speaker name
        const validVoice = voices.find((v) => v.id === turn.voiceId);
        const fallbackVoice = voices.find(
          (v) =>
            v.label.toLowerCase() ===
            turn.speaker.trim().toLowerCase()
        );
        return {
          speaker: turn.speaker || '',
          text: turn.text || '',
          voiceId:
            validVoice?.id ||
            fallbackVoice?.id ||
            voices[0]?.id ||
            '',
          emotion: turn.emotion || '',
        };
      });
      setTurns(validatedTurns);
    }
  }, [initialTurns, voices]);

  useEffect(() => {
    if (status === 'done' && audioUrl && playerRef.current) {
      playerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [status, audioUrl]);

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

  const turnsEqual = (
    a: ConversationTurn[],
    b: ConversationTurn[] | null
  ) => {
    if (!b || a.length !== b.length) return false;
    return a.every(
      (turn, i) =>
        turn.speaker === b[i].speaker &&
        turn.text === b[i].text &&
        turn.voiceId === b[i].voiceId &&
        (turn.emotion || '') === (b[i].emotion || '')
    );
  };

  const handleCopyTranscript = () => {
    const transcript = turns
      .map(
        (turn) =>
          `${
            turn.speaker ||
            voices.find((v) => v.id === turn.voiceId)?.label ||
            'Speaker'
          }: ${turn.text}`
      )
      .join('\n');
    navigator.clipboard.writeText(transcript).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 1500);
    });
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'conversation.mp3';
    a.click();
  };

  const handleShare = () => {
    if (navigator.share && audioUrl) {
      navigator.share({
        title: 'AI Podcaster Conversation',
        text: 'Listen to this AI-generated podcast conversation!',
        url: audioUrl,
      });
    } else {
      navigator.clipboard.writeText(audioUrl || '');
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 1500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (turnsEqual(turns, lastSubmittedTurns)) {
      setError(
        'No changes detected. Please modify the conversation before generating again.'
      );
      return;
    }
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
      setLastSubmittedTurns(turns.map((t) => ({ ...t }))); // Save a copy
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
          disabled={
            status === 'loading' ||
            turnsEqual(turns, lastSubmittedTurns)
          }
          color='primary'
          variant='contained'
          sx={{ ml: 'auto', minWidth: 180 }}
        >
          {status === 'loading' ? (
            <>
              <CustomLoader size={20} />
              <span style={{ marginLeft: 8 }}>Generating...</span>
            </>
          ) : (
            'Generate Conversation Audio'
          )}
        </Button>
      </Box>
      {error && (
        <Alert severity='error' sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      {status === 'done' && audioUrl && (
        <Box sx={{ mt: 2 }} ref={playerRef}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: '#181A20',
              borderRadius: 2,
              p: 2,
              boxShadow: '0 2px 12px #41D1FF22',
              mb: 2,
            }}
          >
            <audio
              controls
              src={audioUrl}
              style={{
                width: '100%',
                maxWidth: 420,
                borderRadius: 8,
                background: '#23262F',
              }}
            />
            <Tooltip
              title={
                copyStatus === 'copied'
                  ? 'Copied!'
                  : 'Copy Transcript'
              }
            >
              <IconButton
                color='primary'
                onClick={handleCopyTranscript}
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Download Audio'>
              <IconButton
                color='secondary'
                onClick={handleDownloadAudio}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Share'>
              <IconButton color='info' onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
          {/* Transcript below the player */}
          <Box
            sx={{ mt: 3, bgcolor: '#23262F', borderRadius: 2, p: 2 }}
          >
            <strong>Transcript</strong>
            <Box component='ol' sx={{ pl: 3, mt: 1 }}>
              {turns.map((turn, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  <b>
                    {turn.speaker ||
                      voices.find((v) => v.id === turn.voiceId)
                        ?.label ||
                      'Speaker'}
                    :
                  </b>{' '}
                  {turn.text}
                </li>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </form>
  );
};

export default ConversationBuilder;
