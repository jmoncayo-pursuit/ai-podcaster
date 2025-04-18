# AI Podcaster: Speechify-powered TTS Podcast Generator

A modern, accessible podcast generator that converts scripts to audio using the Speechify API. Features a React + MUI frontend and a TypeScript/Express backend.

Website: https://github.com/your-org/ai-podcaster

Topics: text-to-speech podcast react typescript express mui speechify accessibility

## Features

- Converts text/markdown podcast scripts to mp3 or wav audio using Speechify API
- Multiple voice and format options
- Modern, accessible, and responsive React frontend (Vite + MUI)
- REST API backend (Express + TypeScript)
- CLI/script for easy use

## Technologies Used

- **Frontend:** React 19, TypeScript, Vite, Material UI (MUI v7), Emotion, MUI Icons
- **Backend:** Node.js, Express, TypeScript, Speechify API SDK
- **Other:** dotenv for environment variables, CORS, FileReader API

## Setup

1. Clone this repo
2. Install dependencies for both backend and frontend:
   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Create a `.env` file in both the backend and frontend folders:
   - For the backend, copy `.env.example` to `.env` and set your Speechify API key and backend host/port:
     ```env
     SPEECHIFY_API_KEY=your_key_here
     BACKEND_HOST=localhost
     BACKEND_PORT=3001
     ```
   - For the frontend, create a `.env` file and set the backend and frontend hosts/ports:
     ```env
     VITE_API_HOST=localhost
     VITE_API_PORT=3001
     VITE_FRONTEND_HOST=localhost
     VITE_FRONTEND_PORT=5173
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

Open [http://localhost:5173](http://localhost:5173) in your browser (or the port you set in `.env`).

## Podcast Conversation Workflow (using Lisa & George Voices from Speechify)

To test the podcast-style conversation feature (alternating voices, audio stitching):

1. From the backend directory, run:

   ```sh
   npx ts-node src/conversationWorkflow.ts
   ```

2. This will generate `output.mp3` in the backend folder, with Lisa and George as the speakers.

3. Play `output.mp3` to verify the conversation and distinct voices.

## Environment Variables

- `.env` in the backend should contain:
  ```env
  SPEECHIFY_API_KEY=your_key_here
  BACKEND_HOST=localhost
  BACKEND_PORT=3001
  ```
- `.env` in the frontend should contain:
  ```env
  VITE_API_HOST=localhost
  VITE_API_PORT=3001
  VITE_FRONTEND_HOST=localhost
  VITE_FRONTEND_PORT=5173
  ```

## Notes

- Requires Node.js & TypeScript
- Do not commit your `.env` file or API keys
- Expandable for more podcast features

## Reference

- [Speechify API Docs](https://docs.speechify.com/)
