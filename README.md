# AI Podcaster: Speechify-powered TTS Podcast Generator

## Features

- Converts text/markdown podcast scripts to mp3 audio using Speechify API
- Multiple voice and format options
- Modern, accessible, and responsive React frontend (Vite + MUI)
- REST API backend (Express + TypeScript)
- CLI/script for easy use

## Setup

1. Clone this repo
2. Install dependencies for both backend and frontend:
   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Copy `.env.example` to `.env` at the project root and add your Speechify API key:
   ```sh
   cp .env.example .env
   # Edit .env and set SPEECHIFY_API_KEY
   ```

## Usage

### Backend CLI

Convert a text file to mp3:

```sh
cd backend
npm run cli -- input.txt output.mp3
```

### Backend API

Start the API server:

```sh
cd backend
npm run dev
```

### Frontend

Start the React app:

```sh
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

- `.env` at the project root should contain:
  ```
  SPEECHIFY_API_KEY=your_key_here
  ```

## Notes

- Requires Node.js & TypeScript
- Do not commit your `.env` file or API keys
- Expandable for more podcast features

## Reference

- [Speechify API Docs](https://docs.speechify.com/)
