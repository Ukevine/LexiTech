import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let currentSound: Audio.Sound | null = null;

export async function configureAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.error('Failed to configure audio:', error);
  }
}

export async function stopCurrentAudio(): Promise<void> {
  if (!currentSound) {
    return;
  }

  try {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
  } catch (error) {
    console.error('Failed to stop audio:', error);
  } finally {
    currentSound = null;
  }
}

export async function playPronunciation(audioUrl: string): Promise<void> {
  if (!audioUrl?.trim()) {
    throw new Error('Invalid audio URL');
  }

  await stopCurrentAudio();

  try {
    if (Platform.OS === 'web') {
      const audio = new window.Audio(audioUrl);
      await audio.play();
      return;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true }
    );
    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        stopCurrentAudio();
      }
    });
  } catch (error) {
    console.error('Audio playback failed:', error);
    throw new Error('Pronunciation unavailable.');
  }
}
