# LexiTech Dictionary

Cross-platform English dictionary mobile application built with **React Native (Expo)** for LexiTech Solutions Ltd.

## Features

- Word search with input validation
- Definitions, parts of speech, and example sentences
- Audio pronunciation playback
- Drawer navigation with search history
- Comprehensive error handling (404, network, timeout)
- Android, iOS, and Web support

## API

Uses the [Free Dictionary API](https://dictionaryapi.dev/):

```
GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for mobile testing) or Android/iOS emulator

### Installation

```bash
npm install
```

### Run the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## Project Structure

See [DESIGN.md](./DESIGN.md) for architecture, data flow, and screen documentation.

## Tech Stack

- React Native + Expo SDK 56
- Expo Router (Drawer navigation)
- axios (API requests)
- expo-av (audio playback)
- AsyncStorage (search history)
