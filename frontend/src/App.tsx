import './App.css';
import { useRef, useState } from 'react';

function App() {
  const [script, setScript] = useState('');
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
        body: JSON.stringify({ text: script }),
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
    <main className='container'>
      <h1>AI Podcaster</h1>
      <form
        onSubmit={handleSubmit}
        aria-label='Podcast script upload or input form'
      >
        <label htmlFor='script-input' className='visually-hidden'>
          Podcast Script
        </label>
        <textarea
          id='script-input'
          aria-label='Podcast script text area'
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder='Paste or type your podcast script here...'
          rows={8}
          required
        />
        <div className='actions'>
          <input
            type='file'
            accept='.txt,.md'
            ref={fileInput}
            onChange={handleFile}
            aria-label='Upload podcast script file'
          />
          <button
            type='submit'
            disabled={status === 'loading'}
            aria-busy={status === 'loading'}
          >
            {status === 'loading'
              ? 'Converting…'
              : 'Convert to Audio'}
          </button>
        </div>
      </form>
      {status === 'done' && audioUrl && (
        <section aria-live='polite' className='result'>
          <h2>Result</h2>
          <audio
            controls
            src={audioUrl}
            aria-label='Podcast audio playback'
          />
        </section>
      )}
      {status === 'error' && (
        <div role='alert' className='error'>
          Something went wrong. Please try again.
        </div>
      )}
    </main>
  );
}

export default App;
