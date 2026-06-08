import { Platform } from 'react-native';
import { AudioPlaybackState, PlaybackStatus } from '../types/dictionary';

type NativePlayer = {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  release: () => void;
  addListener: (
    event: 'playbackStatusUpdate',
    listener: (status: { playing: boolean; isBuffering: boolean; didJustFinish: boolean }) => void
  ) => { remove: () => void };
};

type Listener = (state: AudioPlaybackState) => void;

const PLAYBACK_ERROR = 'Unable to play pronunciation.';

class AudioPlaybackService {
  private state: AudioPlaybackState = {
    activeId: null,
    status: 'stopped',
    error: null,
  };

  private listeners = new Set<Listener>();
  private nativePlayer: NativePlayer | null = null;
  private nativeSubscription: { remove: () => void } | null = null;
  private webAudio: HTMLAudioElement | null = null;
  private webHandlers: {
    loadstart: () => void;
    playing: () => void;
    pause: () => void;
    ended: () => void;
    error: () => void;
  } | null = null;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): AudioPlaybackState {
    return this.state;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private updateState(partial: Partial<AudioPlaybackState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private async getAudioModule() {
    return import('expo-audio');
  }

  private async ensureAudioConfigured(): Promise<void> {
    try {
      const { setAudioModeAsync } = await this.getAudioModule();
      await setAudioModeAsync({ playsInSilentMode: true });
    } catch (error) {
      console.error('Failed to configure audio:', error);
    }
  }

  private cleanupNative(): void {
    this.nativeSubscription?.remove();
    this.nativeSubscription = null;

    if (this.nativePlayer) {
      try {
        this.nativePlayer.pause();
        this.nativePlayer.release();
      } catch (error) {
        console.error('Failed to release native player:', error);
      }
      this.nativePlayer = null;
    }
  }

  private cleanupWeb(): void {
    if (this.webAudio && this.webHandlers) {
      this.webAudio.removeEventListener('loadstart', this.webHandlers.loadstart);
      this.webAudio.removeEventListener('playing', this.webHandlers.playing);
      this.webAudio.removeEventListener('pause', this.webHandlers.pause);
      this.webAudio.removeEventListener('ended', this.webHandlers.ended);
      this.webAudio.removeEventListener('error', this.webHandlers.error);
      this.webAudio.pause();
      this.webAudio.currentTime = 0;
    }
    this.webAudio = null;
    this.webHandlers = null;
  }

  private async stopInternal(): Promise<void> {
    this.cleanupNative();
    this.cleanupWeb();
  }

  private handlePlaybackFinished(): void {
    this.updateState({ status: 'stopped', error: null });
  }

  private handlePlaybackError(): void {
    this.stopInternal();
    this.updateState({
      status: 'error',
      error: PLAYBACK_ERROR,
      activeId: this.state.activeId,
    });
  }

  private setupWebAudio(audioUrl: string): void {
    const audio = new window.Audio(audioUrl);
    this.webAudio = audio;

    const handlers = {
      loadstart: () => this.updateState({ status: 'loading', error: null }),
      playing: () => this.updateState({ status: 'playing', error: null }),
      pause: () => {
        if (audio.currentTime > 0 && !audio.ended) {
          this.updateState({ status: 'paused', error: null });
        }
      },
      ended: () => this.handlePlaybackFinished(),
      error: () => this.handlePlaybackError(),
    };

    this.webHandlers = handlers;
    audio.addEventListener('loadstart', handlers.loadstart);
    audio.addEventListener('playing', handlers.playing);
    audio.addEventListener('pause', handlers.pause);
    audio.addEventListener('ended', handlers.ended);
    audio.addEventListener('error', handlers.error);
  }

  private async setupNativeAudio(audioUrl: string): Promise<void> {
    await this.ensureAudioConfigured();
    const { createAudioPlayer } = await this.getAudioModule();
    const player = createAudioPlayer(audioUrl) as NativePlayer;
    this.nativePlayer = player;

    this.nativeSubscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        this.handlePlaybackFinished();
        return;
      }

      if (status.isBuffering) {
        this.updateState({ status: 'loading', error: null });
        return;
      }

      if (status.playing) {
        this.updateState({ status: 'playing', error: null });
        return;
      }

      if (this.state.status !== 'stopped' && this.state.status !== 'error') {
        this.updateState({ status: 'paused', error: null });
      }
    });
  }

  async play(id: string, audioUrl: string): Promise<void> {
    if (!audioUrl?.trim()) {
      this.updateState({ status: 'error', error: PLAYBACK_ERROR, activeId: id });
      return;
    }

    const isResuming = this.state.activeId === id && this.state.status === 'paused';

    try {
      if (isResuming) {
        this.updateState({ status: 'loading', error: null });
        if (Platform.OS === 'web' && this.webAudio) {
          await this.webAudio.play();
          return;
        }
        if (this.nativePlayer) {
          this.nativePlayer.play();
          return;
        }
      }

      await this.stopInternal();

      this.updateState({ activeId: id, status: 'loading', error: null });

      if (Platform.OS === 'web') {
        this.setupWebAudio(audioUrl);
        await this.webAudio!.play();
        return;
      }

      await this.setupNativeAudio(audioUrl);
      this.nativePlayer?.play();
    } catch (error) {
      console.error('Audio play failed:', error);
      await this.stopInternal();
      this.updateState({ activeId: id, status: 'error', error: PLAYBACK_ERROR });
    }
  }

  async pause(id: string): Promise<void> {
    if (this.state.activeId !== id || this.state.status !== 'playing') {
      return;
    }

    try {
      if (Platform.OS === 'web') {
        this.webAudio?.pause();
      } else {
        this.nativePlayer?.pause();
      }
      this.updateState({ status: 'paused', error: null });
    } catch (error) {
      console.error('Audio pause failed:', error);
      this.handlePlaybackError();
    }
  }

  async stop(id: string): Promise<void> {
    if (this.state.activeId !== id) {
      return;
    }

    try {
      if (Platform.OS === 'web' && this.webAudio) {
        this.webAudio.pause();
        this.webAudio.currentTime = 0;
      } else if (this.nativePlayer) {
        this.nativePlayer.pause();
        this.nativePlayer.seekTo(0);
      }

      this.updateState({ status: 'stopped', error: null });
    } catch (error) {
      console.error('Audio stop failed:', error);
      await this.stopInternal();
      this.updateState({ activeId: id, status: 'stopped', error: null });
    }
  }

  async stopAll(): Promise<void> {
    await this.stopInternal();
    this.updateState({ activeId: null, status: 'stopped', error: null });
  }
}

export const audioPlaybackService = new AudioPlaybackService();

export function getStatusLabel(status: PlaybackStatus): string {
  switch (status) {
    case 'loading':
      return 'Loading';
    case 'playing':
      return 'Playing';
    case 'paused':
      return 'Paused';
    case 'error':
      return 'Error';
    default:
      return 'Stopped';
  }
}
