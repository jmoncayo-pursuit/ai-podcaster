import { convertTextToSpeech } from './speechify';
import * as fs from 'fs';
import 'dotenv/config';

async function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error(
      'Usage: ts-node src/index.ts <input.txt> <output.mp3>'
    );
    process.exit(1);
  }
  const text = fs.readFileSync(inputPath, 'utf8');
  const audioBuffer = await convertTextToSpeech(text);
  fs.writeFileSync(outputPath, audioBuffer);
  console.log(`Audio saved to ${outputPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
