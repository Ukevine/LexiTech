import { useEffect, useState } from 'react';
import { audioPlaybackService } from '../services/audioService';
import { AudioPlaybackState } from '../types/dictionary';

export function useAudioPlayback(): AudioPlaybackState {
  const [state, setState] = useState<AudioPlaybackState>(audioPlaybackService.getState());

  useEffect(() => {
    return audioPlaybackService.subscribe(setState);
  }, []);

  return state;
}
