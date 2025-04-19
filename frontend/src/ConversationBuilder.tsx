import React, { useState, useEffect } from 'react';

interface ConversationTurn {
  speaker: string;
  text: string;
  voiceId: string;
}

interface ConversationBuilderProps {
  voices: { id: string; label: string; gender: string }[];
  apiUrl: string;
  initialTurns?: ConversationTurn[]; // New prop to accept initial turns
}

const ConversationBuilder: React.FC<ConversationBuilderProps> = ({
  voices,
  apiUrl,
  initialTurns,
}) => {
  const [turns, setTurns] = useState<ConversationTurn[]>([
    { speaker: '', text: '', voiceId: voices[0]?.id || '' },
  ]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  // Use initialTurns when provided
  useEffect(() => {
    if (initialTurns && initialTurns.length > 0) {
      const validatedTurns = initialTurns.map((turn) => {
        // Find a voice matching the speaker name (case-insensitive)
        const match = voices.find(
          (v) => v.label.toLowerCase() === turn.speaker.toLowerCase()
        );
        return {
          speaker: turn.speaker || '',
          text: turn.text || '',
          voiceId: match?.id || voices[0]?.id || '',
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
      { speaker: '', text: '', voiceId: voices[0]?.id || '' },
    ]);
  const removeTurn = (idx: number) =>
    setTurns((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    for (const turn of turns) {
      if (!turn.speaker.trim())
        return 'Each turn must have a speaker name.';
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
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: turns,
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
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {turns.map((turn, idx) => (
        <div
          key={idx}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <input
            type='text'
            placeholder='Speaker'
            value={turn.speaker}
            onChange={(e) =>
              handleTurnChange(idx, 'speaker', e.target.value)
            }
            style={{ width: 100 }}
            required
          />
          <select
            value={turn.voiceId}
            onChange={(e) =>
              handleTurnChange(idx, 'voiceId', e.target.value)
            }
            required
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
          <textarea
            placeholder='Text'
            value={turn.text}
            onChange={(e) =>
              handleTurnChange(idx, 'text', e.target.value)
            }
            required
            rows={2}
            style={{ flex: 1 }}
          />
          <button
            type='button'
            onClick={() => removeTurn(idx)}
            disabled={turns.length === 1}
          >
            Remove
          </button>
        </div>
      ))}
      <button type='button' onClick={addTurn}>
        Add Turn
      </button>
      <button
        type='submit'
        disabled={status === 'loading'}
        style={{ marginTop: 12 }}
      >
        {status === 'loading'
          ? 'Generating...'
          : 'Generate Conversation Audio'}
      </button>
      {error && (
        <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
      )}
      {status === 'done' && audioUrl && (
        <div style={{ marginTop: 16 }}>
          <audio controls src={audioUrl} style={{ width: '100%' }} />
        </div>
      )}
    </form>
  );
};

export default ConversationBuilder;
