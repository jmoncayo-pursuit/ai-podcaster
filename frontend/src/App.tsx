import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import './App.css';

const VOICES = [
  { id: 'george', label: 'George (Default)' },
  { id: 'rob', label: 'Rob' },
  { id: 'monica', label: 'Monica' },
];

function App() {
  const [script, setScript] = useState('');
  const [voiceId, setVoiceId] = useState('george');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setScript((ev.target?.result as string) || '');
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setAudioUrl(null);
    try {
      const res = await fetch('http://localhost:3001/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script, voiceId }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Container
      maxWidth='sm'
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{
          mt: 4,
          p: 3,
          bgcolor: '#23262F',
          borderRadius: 3,
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
        aria-label='Podcast script upload or input form'
      >
        <Typography
          variant='h3'
          align='center'
          fontWeight={700}
          gutterBottom
        >
          AI Podcaster
        </Typography>
        <TextField
          id='script-input'
          label='Podcast Script'
          aria-label='Podcast script text area'
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder='Paste or type your podcast script here...'
          multiline
          minRows={6}
          required
          fullWidth
          InputProps={{
            style: { background: '#181A20', color: '#F3F4F6' },
          }}
          InputLabelProps={{
            style: {
              color: '#F3F4F6',
              background: '#23262F',
              padding: '0 4px',
            },
          }}
        />
        <Box
          display='flex'
          gap={2}
          alignItems='center'
          flexWrap='wrap'
        >
          <Button
            variant='outlined'
            component='label'
            startIcon={<UploadFileIcon />}
            aria-label='Upload podcast script file'
            sx={{
              color: '#F3F4F6',
              borderColor: '#6C47FF',
              '&:hover': { borderColor: '#4B2ED6' },
            }}
          >
            Upload File
            <input
              type='file'
              accept='.txt,.md'
              hidden
              ref={fileInput}
              onChange={handleFile}
            />
          </Button>
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel id='voice-select-label'>Voice</InputLabel>
            <Select
              labelId='voice-select-label'
              id='voice-select'
              value={voiceId}
              label='Voice'
              onChange={(e) => setVoiceId(e.target.value)}
              aria-label='Select voice for podcast audio'
              sx={{ color: '#F3F4F6', background: '#181A20' }}
            >
              {VOICES.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            disabled={status === 'loading'}
            aria-busy={status === 'loading'}
            sx={{
              ml: 'auto',
              minWidth: 160,
              fontWeight: 600,
              fontSize: '1.1rem',
              bgcolor: '#6C47FF',
              '&:hover': { bgcolor: '#4B2ED6' },
            }}
          >
            {status === 'loading' ? (
              <>
                <CircularProgress
                  size={22}
                  sx={{ color: '#fff', mr: 1 }}
                />
                Converting…
              </>
            ) : (
              'Convert to Audio'
            )}
          </Button>
        </Box>
        {status === 'done' && audioUrl && (
          <Box mt={3} textAlign='center'>
            <Typography variant='h5' fontWeight={500} gutterBottom>
              <AudiotrackIcon
                sx={{ verticalAlign: 'middle', mr: 1 }}
              />
              Result
            </Typography>
            <audio
              controls
              src={audioUrl}
              aria-label='Podcast audio playback'
              style={{ width: '100%' }}
            />
          </Box>
        )}
        {status === 'error' && (
          <Alert severity='error'>
            Something went wrong. Please try again.
          </Alert>
        )}
      </Box>
    </Container>
  );
}

export default App;
