import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import { ThemeProvider } from '@mui/material/styles';
import Icon192 from './assets/icon assets/android-chrome-192x192.png';
import ConversationBuilder from './ConversationBuilder';
import { VOICES } from './voices'; // Import shared voices
import darkTheme from './theme';
import CustomLoader from './CustomLoader';

// Define the ConversationTurn interface to match what's used in ConversationBuilder
interface ConversationTurn {
  speaker: string;
  text: string;
  voiceId: string;
  emotion?: string;
}

const FORMATS = [
  { id: 'mp3', label: 'MP3' },
  { id: 'wav', label: 'WAV' },
];

// API base URL logic using environment variables
const apiHost = import.meta.env.VITE_API_HOST || 'localhost';
const apiPort = import.meta.env.VITE_API_PORT || '3001';
const apiBase =
  apiPort === '443'
    ? `https://${apiHost}`
    : `http://${apiHost}:${apiPort}`;
const apiUrl = `${apiBase}/api/tts`;
const conversationApiUrl = `${apiBase}/api/conversation`;
const aiConversationApiUrl = `${apiBase}/api/ai-conversation`;

function App() {
  const [script, setScript] = useState('');
  const [voiceId, setVoiceId] = useState(() => {
    return (
      VOICES.find((v) => v.gender === 'female')?.id || VOICES[0].id
    );
  });
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<'all' | 'female' | 'male'>(
    'all'
  );
  const [mode, setMode] = useState<'ai' | 'single' | 'conversation'>(
    'ai'
  );
  const [aiInput, setAiInput] = useState('');
  const [aiTurns, setAiTurns] = useState(4);
  const [aiSpeakers, setAiSpeakers] = useState(2);
  const [aiLength, setAiLength] = useState(600);
  const [aiStatus, setAiStatus] = useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiConversation, setAiConversation] = useState<
    ConversationTurn[]
  >([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const filteredVoices =
    gender === 'all'
      ? VOICES
      : VOICES.filter((v) => v.gender === gender);

  React.useEffect(() => {
    if (
      !filteredVoices.find((v) => v.id === voiceId) &&
      filteredVoices.length > 0
    ) {
      setVoiceId(filteredVoices[0].id);
    }
  }, [gender, filteredVoices, voiceId]);

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
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script, voiceId, audioFormat }),
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
    <ThemeProvider theme={darkTheme}>
      <Container
        maxWidth='sm'
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={4}
          sx={{ mt: 4, p: 3, borderRadius: 6, bgcolor: '#23262F' }}
        >
          <Box
            display='flex'
            alignItems='center'
            justifyContent='center'
            mb={2}
          >
            <img
              src={Icon192}
              alt='AI Podcaster logo'
              width={48}
              height={48}
              style={{ marginRight: 12 }}
            />
            <Typography
              variant='h3'
              align='center'
              fontWeight={500}
              gutterBottom
              sx={{
                color: '#6C47FF',
                letterSpacing: 2,
                textShadow: '0 2px 12px rgba(108,71,255,0.25)',
                fontFamily: 'Roboto, system-ui, Arial, sans-serif',
                background:
                  'linear-gradient(90deg, #6C47FF 0%, #41D1FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              AI Podcaster
            </Typography>
          </Box>
          <Box mb={2} display='flex' justifyContent='center' gap={2}>
            <Button
              variant={mode === 'ai' ? 'contained' : 'outlined'}
              onClick={() => setMode('ai')}
            >
              AI Conversation Constructor
            </Button>
            <Button
              variant={mode === 'single' ? 'contained' : 'outlined'}
              onClick={() => setMode('single')}
            >
              Single Speaker
            </Button>
            <Button
              variant={
                mode === 'conversation' ? 'contained' : 'outlined'
              }
              onClick={() => setMode('conversation')}
            >
              Conversation Builder
            </Button>
          </Box>
          {mode === 'ai' && (
            <Box
              sx={{
                bgcolor: '#181A20',
                p: 3,
                borderRadius: 3,
                mb: 3,
              }}
            >
              <Typography
                variant='h5'
                sx={{ color: '#6C47FF', mb: 2 }}
              >
                AI Conversation Constructor
              </Typography>
              <TextField
                label='Topic, prompt, or paste content'
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                sx={{ mb: 2 }}
              />
              <Box display='flex' gap={2} mb={2}>
                <TextField
                  label='Number of Turns'
                  type='number'
                  value={aiTurns}
                  onChange={(e) => setAiTurns(Number(e.target.value))}
                  InputProps={{
                    inputProps: { min: 2, max: 20 },
                  }}
                  sx={{ width: 120 }}
                />
                <TextField
                  label='Speakers'
                  type='number'
                  value={aiSpeakers}
                  onChange={(e) =>
                    setAiSpeakers(Number(e.target.value))
                  }
                  InputProps={{
                    inputProps: { min: 1, max: 10 },
                  }}
                  sx={{ width: 120 }}
                />
                <TextField
                  label='Length Limit (chars)'
                  type='number'
                  value={aiLength}
                  onChange={(e) =>
                    setAiLength(Number(e.target.value))
                  }
                  InputProps={{
                    inputProps: { min: 100, max: 2000 },
                  }}
                  sx={{ width: 160 }}
                />
              </Box>
              <Box display='flex' gap={2}>
                <Button
                  variant='contained'
                  color='primary'
                  disabled={aiStatus === 'loading' || !aiInput.trim()}
                  onClick={async () => {
                    setAiStatus('loading');
                    setAiError(null);
                    setAiConversation([]);
                    try {
                      const res = await fetch(aiConversationApiUrl, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          input: aiInput,
                          turns: aiTurns,
                          speakers: aiSpeakers,
                          length: aiLength,
                        }),
                      });
                      if (!res.ok) {
                        const err = await res
                          .json()
                          .catch(() => ({}));
                        throw new Error(
                          err.error || 'AI conversation failed'
                        );
                      }
                      const data = await res.json();
                      setAiConversation(data.conversation || []);
                      setAiStatus('done');
                    } catch (e: any) {
                      setAiError(
                        e.message || 'Something went wrong.'
                      );
                      setAiStatus('error');
                    }
                  }}
                >
                  {aiStatus === 'loading' ? (
                    <>
                      <CustomLoader size={18} />
                      <span style={{ marginLeft: 8 }}>
                        Generating...
                      </span>
                    </>
                  ) : (
                    'Generate Conversation'
                  )}
                </Button>
              </Box>
              {aiStatus === 'loading' && (
                <Alert severity='info' sx={{ mt: 2 }}>
                  Generating conversation, please wait...
                </Alert>
              )}
              {aiError && (
                <Alert severity='error' sx={{ mt: 2 }}>
                  {aiError}
                </Alert>
              )}
              {aiStatus === 'done' && aiConversation.length > 0 && (
                <Box mt={3}>
                  <Alert severity='success' sx={{ mb: 2 }}>
                    AI conversation generated! Review and edit below.
                  </Alert>
                  <Typography
                    variant='subtitle1'
                    sx={{ color: '#41D1FF', mb: 1 }}
                  >
                    Preview & Edit Conversation
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {aiConversation.map((turn, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          mb: 1,
                          p: 1,
                          bgcolor: '#23262F',
                          borderRadius: 2,
                        }}
                      >
                        <b>{turn.speaker}:</b> {turn.text}
                        {turn.voiceId && (
                          <span
                            style={{
                              color: '#6C47FF',
                              marginLeft: 8,
                              fontSize: '0.95em',
                            }}
                          >
                            [{turn.voiceId}]
                          </span>
                        )}
                        {turn.emotion && turn.emotion !== 'None' && (
                          <span
                            style={{
                              color: '#41D1FF',
                              marginLeft: 8,
                              fontSize: '0.95em',
                            }}
                          >
                            ({turn.emotion})
                          </span>
                        )}
                      </Box>
                    ))}
                  </Box>
                  <Button
                    variant='contained'
                    color='secondary'
                    onClick={() => {
                      setMode('conversation');
                    }}
                  >
                    Send to Conversation Builder
                  </Button>
                </Box>
              )}
            </Box>
          )}
          {mode === 'single' && (
            <Box
              component='form'
              onSubmit={handleSubmit}
              aria-label='Podcast script upload or input form'
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
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
                sx={{
                  background: '#181A20',
                  color: '#F3F4F6',
                  '& .MuiInputBase-root': {
                    color: '#F3F4F6',
                    background: '#181A20',
                    borderRadius: 2,
                  },
                  '& .MuiInputLabel-root': {
                    color: '#F3F4F6',
                    background: '#23262F',
                    px: '4px',
                  },
                }}
              />
              <Box mb={2}>
                <Box
                  sx={{
                    mb: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Button
                    variant={
                      gender === 'all' ? 'contained' : 'outlined'
                    }
                    size='small'
                    sx={{
                      borderRadius: 4,
                      minWidth: 0,
                      px: 2,
                      bgcolor:
                        gender === 'all' ? '#6C47FF' : undefined,
                    }}
                    onClick={() => setGender('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={
                      gender === 'female' ? 'contained' : 'outlined'
                    }
                    size='small'
                    sx={{
                      borderRadius: 4,
                      minWidth: 0,
                      px: 2,
                      bgcolor:
                        gender === 'female' ? '#6C47FF' : undefined,
                    }}
                    onClick={() => setGender('female')}
                    title='Female'
                  >
                    <FemaleIcon
                      sx={{ verticalAlign: 'middle', mr: 0.5 }}
                    />
                  </Button>
                  <Button
                    variant={
                      gender === 'male' ? 'contained' : 'outlined'
                    }
                    size='small'
                    sx={{
                      borderRadius: 4,
                      minWidth: 0,
                      px: 2,
                      bgcolor:
                        gender === 'male' ? '#6C47FF' : undefined,
                    }}
                    onClick={() => setGender('male')}
                    title='Male'
                  >
                    <MaleIcon
                      sx={{ verticalAlign: 'middle', mr: 0.5 }}
                    />
                  </Button>
                </Box>
                <FormControl fullWidth>
                  <InputLabel
                    id='voice-select-label'
                    sx={{
                      color: '#F3F4F6',
                      background: '#23262F',
                      px: 0.5,
                    }}
                  >
                    Voice
                  </InputLabel>
                  <Select
                    labelId='voice-select-label'
                    id='voice-select'
                    value={
                      filteredVoices.find((v) => v.id === voiceId)
                        ? voiceId
                        : filteredVoices[0]?.id || ''
                    }
                    label='Voice'
                    onChange={(e) => setVoiceId(e.target.value)}
                    aria-label='Select voice for podcast audio'
                    sx={{
                      color: '#F3F4F6',
                      background: '#181A20',
                      borderRadius: 6,
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: { bgcolor: '#23262F', color: '#F3F4F6' },
                      },
                    }}
                  >
                    {filteredVoices.map((v) => (
                      <MenuItem key={v.id} value={v.id}>
                        {v.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Grid container spacing={2} alignItems='center'>
                <Grid sx={{ flex: 1, minWidth: 0 }}>
                  <Button
                    variant='outlined'
                    component='label'
                    startIcon={<UploadFileIcon />}
                    aria-label='Upload podcast script file (PDF, DOC, DOCX, TXT)'
                    title='Supports PDF, DOC, DOCX, and TXT files'
                    sx={{
                      color: '#F3F4F6',
                      borderColor: '#6C47FF',
                      borderRadius: 6,
                      width: '100%',
                      '&:hover': { borderColor: '#4B2ED6' },
                    }}
                  >
                    Upload File
                    <input
                      type='file'
                      accept='.txt,.pdf,.doc,.docx'
                      hidden
                      ref={fileInput}
                      onChange={handleFile}
                    />
                  </Button>
                  <Typography
                    variant='caption'
                    sx={{
                      color: '#b0b3b8',
                      mt: 0.5,
                      display: 'block',
                      textAlign: 'center',
                    }}
                  >
                    Supports PDF, DOC, DOCX, and TXT files
                  </Typography>
                </Grid>
                <Grid sx={{ flex: 1, minWidth: 0 }}>
                  <FormControl fullWidth>
                    <InputLabel
                      id='format-select-label'
                      sx={{
                        color: '#F3F4F6',
                        background: '#23262F',
                        px: 0.5,
                      }}
                    >
                      Format
                    </InputLabel>
                    <Select
                      labelId='format-select-label'
                      id='format-select'
                      value={audioFormat}
                      label='Format'
                      onChange={(e) => setAudioFormat(e.target.value)}
                      aria-label='Select audio format'
                      sx={{
                        color: '#F3F4F6',
                        background: '#181A20',
                        borderRadius: 6,
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: '#23262F',
                            color: '#F3F4F6',
                          },
                        },
                      }}
                    >
                      {FORMATS.map((f) => (
                        <MenuItem key={f.id} value={f.id}>
                          {f.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={status === 'loading'}
                aria-busy={status === 'loading'}
                sx={{
                  mt: 2,
                  minWidth: 160,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  bgcolor: '#6C47FF',
                  borderRadius: 6,
                  '&:hover': { bgcolor: '#4B2ED6' },
                }}
              >
                {status === 'loading' ? (
                  <>
                    <CustomLoader size={22} />
                    <span style={{ marginLeft: 8 }}>Converting…</span>
                  </>
                ) : (
                  'Convert to Audio'
                )}
              </Button>
              {status === 'done' && audioUrl && (
                <Box mt={3} textAlign='center'>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    mb={1}
                  >
                    <AudiotrackIcon
                      sx={{
                        color: '#6C47FF',
                        fontSize: 32,
                        mr: 1,
                        textShadow:
                          '0 2px 12px rgba(108,71,255,0.25)',
                      }}
                    />
                    <Typography
                      variant='h5'
                      fontWeight={500}
                      sx={{
                        color: '#6C47FF',
                        letterSpacing: 1,
                        textShadow:
                          '0 2px 12px rgba(108,71,255,0.25)',
                        fontFamily:
                          'Roboto, system-ui, Arial, sans-serif',
                        background:
                          'linear-gradient(90deg, #6C47FF 0%, #41D1FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block',
                      }}
                    >
                      Result
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: 420,
                      mx: 'auto',
                    }}
                  >
                    <audio
                      controls
                      src={audioUrl}
                      aria-label='Podcast audio playback'
                      className='custom-audio'
                      style={{ width: '100%' }}
                      id='audio-player'
                    />
                  </Box>
                </Box>
              )}
              {status === 'error' && (
                <Alert severity='error'>
                  Something went wrong. Please try again.
                </Alert>
              )}
            </Box>
          )}
          {mode === 'conversation' && (
            <ConversationBuilder
              voices={VOICES}
              apiUrl={conversationApiUrl}
              initialTurns={
                aiConversation.length > 0
                  ? aiConversation.map((turn) => ({
                      speaker: turn.speaker,
                      text: turn.text,
                      voiceId: turn.voiceId,
                      emotion: turn.emotion || '',
                    }))
                  : undefined
              }
            />
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
