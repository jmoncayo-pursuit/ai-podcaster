# AI Podcaster: Speechify-powered TTS Podcast Generator

## Features

- Converts text/markdown podcast scripts to mp3 audio using Speechify API
- Handles Speechify API character limits
- CLI/script for easy use

## Setup

1. Clone this repo
2. Install dependencies:
   ```sh
   npm install
   ```
3. Copy `.env.example` to `.env` and add your Speechify API key:
   ```sh
   cp .env.example .env
   # Edit .env and set SPEECHIFY_API_KEY
   ```

## Usage

Convert a text file to mp3:

```sh
npx ts-node src/index.ts input.txt output.mp3
```

- Input: Plain text or markdown file
- Output: MP3 audio file

## Example input.txt

Create a file named `input.txt` in the project root with your podcast script, e.g.:

```
Welcome to the AI Podcaster demo!
This is a sample script that will be converted to audio using Speechify.
Enjoy your new podcast episode!
```

After running the CLI, your audio will be saved as `output.mp3`.

## Notes

- Requires Node.js & TypeScript
- Do not commit your `.env` file or API keys
- Expandable for more podcast features

## Reference

- [Speechify API Docs](https://docs.speechify.com/)
- Inspired by [mvp-ai-podcasts](https://github.com/SpeechifyInc/mvp-ai-podcasts.git)
