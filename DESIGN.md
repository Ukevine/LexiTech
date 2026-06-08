# LexiTech Dictionary — Application Design

## Overview

Cross-platform dictionary mobile application built with **React Native (Expo)** that consumes the [Free Dictionary API](https://api.dictionaryapi.dev/api/v2/entries/en/{word}).

**Platforms:** Android, iOS, Web (Expo Web)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Search Screen│  │ Word Details │  │ Drawer (History) │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼─────────────────┼───────────────────┼────────────┘
          │                 │                   │
┌─────────┼─────────────────┼───────────────────┼────────────┐
│         ▼                 ▼                   ▼            │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │  Components │   │ useWordSearch│   │ SearchHistory   │  │
│  │  (UI)       │   │    Hook      │   │   Context       │  │
│  └─────────────┘   └──────┬───────┘   └────────┬────────┘  │
│                           │                    │            │
│                    Business / Service Layer    │            │
│  ┌────────────────────────┼────────────────────┼─────────┐  │
│  │ dictionaryApi (axios)  │  audioService      │ AsyncStorage│
│  │ validation utils       │  errorHandler      │           │  │
│  └────────────────────────┴────────────────────┴─────────┘  │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│              External: Free Dictionary API                 │
│   GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}│
└─────────────────────────────────────────────────────────────┘
```

### Technology Choices

| Concern | Solution |
|---------|----------|
| Framework | React Native + Expo SDK 56 |
| Navigation | Expo Router with Drawer |
| HTTP Client | axios |
| Audio | expo-av (native), HTML5 Audio (web) |
| Persistence | AsyncStorage (search history) |
| State | React Context + local component state |

---

## Data Flow Diagram

```
User enters word
       │
       ▼
┌──────────────┐     Invalid     ┌─────────────────┐
│  Validation  │ ──────────────► │ Show validation │
│  (trim, regex)│                 │     message     │
└──────┬───────┘                 └─────────────────┘
       │ Valid
       ▼
┌──────────────┐     Loading     ┌─────────────────┐
│  API Request │ ──────────────► │ Show spinner,   │
│   (axios)    │                 │ disable search  │
└──────┬───────┘                 └─────────────────┘
       │
   ┌───┴───┐
   │       │
Success   Error
   │       │
   ▼       ▼
Parse   Map error type
JSON    (404, timeout, network)
   │       │
   ▼       ▼
Display  Show friendly
details  error + retry
   │
   ▼
Add to search history (no duplicates)
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v2/entries/en/{word}` | GET | Fetch word definitions, phonetics, meanings |

**Base URL:** `https://api.dictionaryapi.dev`

**Response fields used:**
- `word` — main word
- `phonetic` / `phonetics[]` — pronunciation text and audio URLs
- `meanings[]` — parts of speech with nested `definitions[]`
- `definitions[].definition` — definition text
- `definitions[].example` — usage example (optional)

---

## Screens / Pages

| Screen | Route | Purpose |
|--------|-------|---------|
| Search | `/(drawer)/` | Word input, validation, navigation to results |
| Word Details | `/(drawer)/word?q={word}` | Definitions, phonetics, audio, examples |
| Drawer | Side menu | Search history, navigation to home |

---

## Key Validation Rules

1. **Input:** Trim whitespace; reject empty, null, spaces-only
2. **Characters:** English letters, hyphens, apostrophes only
3. **API:** Encode URL; validate JSON structure before rendering
4. **Audio:** Verify URL exists and is playable before showing icon
5. **History:** Case-insensitive deduplication; max 50 entries
6. **Requests:** Block duplicate in-flight requests; disable button while loading

---

## Error Messages

| Scenario | Message |
|----------|---------|
| Invalid input | Please enter a valid English word |
| 404 | Word not found. |
| No network | No internet connection. |
| Timeout | Request timed out. Please try again. |
| Server error | Unable to fetch data. Please try again later. |
| Audio failure | Pronunciation unavailable. |
| Unknown | Something went wrong. |

---

## File Structure

```
app/
  _layout.tsx              # Root providers
  (drawer)/
    _layout.tsx            # Drawer navigation
    index.tsx              # Search screen
    word.tsx               # Word details screen
components/                # Reusable UI components
context/                   # Search history context
hooks/                     # useWordSearch
services/                  # API & audio services
types/                     # TypeScript interfaces
utils/                     # Validation & error handling
constants/                 # Theme tokens
```
