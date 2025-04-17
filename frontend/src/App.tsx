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
  Grid,
  Paper,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import Icon192 from './assets/icon assets/android-chrome-192x192.png';

const VOICES = [
  { id: 'monica', label: 'Monica (Default)', gender: 'female' },
  { id: 'bwyneth', label: 'Bwyneth', gender: 'female' },
  { id: 'carly', label: 'Carly', gender: 'female' },
  { id: 'kristy', label: 'Kristy', gender: 'female' },
  { id: 'tasha', label: 'Tasha', gender: 'female' },
  { id: 'lisa', label: 'Lisa', gender: 'female' },
  { id: 'emily', label: 'Emily', gender: 'female' },
  { id: 'julie', label: 'Julie', gender: 'female' },
  { id: 'erin', label: 'Erin', gender: 'female' },
  { id: 'lindsey', label: 'Lindsey', gender: 'female' },
  { id: 'stacy', label: 'Stacy', gender: 'female' },
  { id: 'evelyn', label: 'Evelyn', gender: 'female' },
  { id: 'victoria', label: 'Victoria', gender: 'female' },
  { id: 'george', label: 'George', gender: 'male' },
  { id: 'oliver', label: 'Oliver', gender: 'male' },
  { id: 'joe', label: 'Joe', gender: 'male' },
  { id: 'mark', label: 'Mark', gender: 'male' },
  { id: 'nick', label: 'Nick', gender: 'male' },
  { id: 'jack', label: 'Jack', gender: 'male' },
  { id: 'jesse', label: 'Jesse', gender: 'male' },
  { id: 'keenan', label: 'Keenan', gender: 'male' },
  { id: 'jacob', label: 'Jacob', gender: 'male' },
  { id: 'james', label: 'James', gender: 'male' },
  { id: 'mason', label: 'Mason', gender: 'male' },
  { id: 'matthew', label: 'Matthew', gender: 'male' },
  { id: 'brian', label: 'Brian', gender: 'male' },
  { id: 'anthony', label: 'Anthony', gender: 'male' },
  { id: 'donald', label: 'Donald', gender: 'male' },
  { id: 'paul', label: 'Paul', gender: 'male' },
  { id: 'steven', label: 'Steven', gender: 'male' },
  { id: 'andrew', label: 'Andrew', gender: 'male' },
  { id: 'kenneth', label: 'Kenneth', gender: 'male' },
  { id: 'joshua', label: 'Joshua', gender: 'male' },
  { id: 'samuel', label: 'Samuel', gender: 'male' },
  { id: 'gregory', label: 'Gregory', gender: 'male' },
  { id: 'frank', label: 'Frank', gender: 'male' },
  { id: 'alexander', label: 'Alexander', gender: 'male' },
  { id: 'raymond', label: 'Raymond', gender: 'male' },
  { id: 'patrick', label: 'Patrick', gender: 'male' },
  { id: 'bruce', label: 'Bruce', gender: 'male' },
  { id: 'bobby', label: 'Bobby', gender: 'male' },
  { id: 'johnny', label: 'Johnny', gender: 'male' },
  { id: 'bradley', label: 'Bradley', gender: 'male' },
  { id: 'dale', label: 'Dale', gender: 'male' },
  { id: 'howard', label: 'Howard', gender: 'male' },
  { id: 'fred', label: 'Fred', gender: 'male' },
  { id: 'blake', label: 'Blake', gender: 'male' },
  { id: 'dennis', label: 'Dennis', gender: 'male' },
  { id: 'jerry', label: 'Jerry', gender: 'male' },
  { id: 'tyler', label: 'Tyler', gender: 'male' },
  { id: 'aaron', label: 'Aaron', gender: 'male' },
  { id: 'larry', label: 'Larry', gender: 'male' },
  { id: 'keith', label: 'Keith', gender: 'male' },
  { id: 'scott', label: 'Scott', gender: 'male' },
  { id: 'curtis', label: 'Curtis', gender: 'male' },
  { id: 'todd', label: 'Todd', gender: 'male' },
  { id: 'leonard', label: 'Leonard', gender: 'male' },
  { id: 'calvin', label: 'Calvin', gender: 'male' },
  { id: 'edwin', label: 'Edwin', gender: 'male' },
  { id: 'don', label: 'Don', gender: 'male' },
  { id: 'craig', label: 'Craig', gender: 'male' },
  { id: 'danny', label: 'Danny', gender: 'male' },
  { id: 'stanley', label: 'Stanley', gender: 'male' },
  { id: 'jeffery', label: 'Jeffery', gender: 'male' },
  { id: 'herbert', label: 'Herbert', gender: 'male' },
  { id: 'lee', label: 'Lee', gender: 'male' },
  { id: 'trevor', label: 'Trevor', gender: 'male' },
  { id: 'brendan', label: 'Brendan', gender: 'male' },
  { id: 'toby', label: 'Toby', gender: 'male' },
  { id: 'van', label: 'Van', gender: 'male' },
  { id: 'myron', label: 'Myron', gender: 'male' },
  { id: 'boyd', label: 'Boyd', gender: 'male' },
  { id: 'joel', label: 'Joel', gender: 'male' },
  { id: 'earl', label: 'Earl', gender: 'male' },
  { id: 'brett', label: 'Brett', gender: 'male' },
  { id: 'steve', label: 'Steve', gender: 'male' },
  { id: 'jon', label: 'Jon', gender: 'male' },
  { id: 'bob', label: 'Bob', gender: 'male' },
  { id: 'jim', label: 'Jim', gender: 'male' },
  { id: 'matt', label: 'Matt', gender: 'male' },
  { id: 'lyle', label: 'Lyle', gender: 'male' },
  { id: 'hubert', label: 'Hubert', gender: 'male' },
  { id: 'kenny', label: 'Kenny', gender: 'male' },
  { id: 'doug', label: 'Doug', gender: 'male' },
  { id: 'sammy', label: 'Sammy', gender: 'male' },
  { id: 'homer', label: 'Homer', gender: 'male' },
  { id: 'wendell', label: 'Wendell', gender: 'male' },
  { id: 'woodrow', label: 'Woodrow', gender: 'male' },
  { id: 'felipe', label: 'Felipe', gender: 'male' },
  { id: 'garry', label: 'Garry', gender: 'male' },
  { id: 'pete', label: 'Pete', gender: 'male' },
  { id: 'marco', label: 'Marco', gender: 'male' },
  { id: 'rufus', label: 'Rufus', gender: 'male' },
  { id: 'owen', label: 'Owen', gender: 'male' },
  { id: 'bryant', label: 'Bryant', gender: 'male' },
  { id: 'abraham', label: 'Abraham', gender: 'male' },
  { id: 'irving', label: 'Irving', gender: 'male' },
  { id: 'jermaine', label: 'Jermaine', gender: 'male' },
  { id: 'julius', label: 'Julius', gender: 'male' },
  { id: 'marty', label: 'Marty', gender: 'male' },
  { id: 'russell', label: 'Russell', gender: 'male' },
  { id: 'benjamin', label: 'Benjamin', gender: 'male' },
  { id: 'michael', label: 'Michael', gender: 'male' },
  { id: 'collin', label: 'Collin', gender: 'male' },
  { id: 'phil', label: 'Phil', gender: 'male' },
  { id: 'archie', label: 'Archie', gender: 'male' },
  { id: 'freddie', label: 'Freddie', gender: 'male' },
  { id: 'harper', label: 'Harper', gender: 'male' },
  { id: 'austin', label: 'Austin', gender: 'male' },
  { id: 'derek', label: 'Derek', gender: 'male' },
  { id: 'ellis', label: 'Ellis', gender: 'male' },
  { id: 'ian', label: 'Ian', gender: 'male' },
  { id: 'oscar', label: 'Oscar', gender: 'male' },
];

const FORMATS = [
  { id: 'mp3', label: 'MP3' },
  { id: 'wav', label: 'WAV' },
];

function App() {
  const [script, setScript] = useState('');
  const [voiceId, setVoiceId] = useState('monica');
  const [audioFormat, setAudioFormat] = useState('mp3');
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
          component='form'
          onSubmit={handleSubmit}
          aria-label='Podcast script upload or input form'
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
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
          <Grid
            container
            spacing={2}
            alignItems='center'
            columns={12}
          >
            <Grid span={4}>
              <Button
                variant='outlined'
                component='label'
                startIcon={<UploadFileIcon />}
                aria-label='Upload podcast script file'
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
                  accept='.txt,.md'
                  hidden
                  ref={fileInput}
                  onChange={handleFile}
                />
              </Button>
            </Grid>
            <Grid span={4}>
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
                  value={voiceId}
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
                  {VOICES.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid span={4}>
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
                      sx: { bgcolor: '#23262F', color: '#F3F4F6' },
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
                    textShadow: '0 2px 12px rgba(108,71,255,0.25)',
                  }}
                />
                <Typography
                  variant='h5'
                  fontWeight={500}
                  sx={{
                    color: '#6C47FF',
                    letterSpacing: 1,
                    textShadow: '0 2px 12px rgba(108,71,255,0.25)',
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
      </Paper>
    </Container>
  );
}

export default App;
