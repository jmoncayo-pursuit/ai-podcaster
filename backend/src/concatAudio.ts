import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

/**
 * Concatenate multiple audio files (mp3 or wav) into a single output file using ffmpeg.
 * @param inputFiles Array of input audio file paths (in order)
 * @param outputFile Output file path (should end with .mp3 or .wav)
 * @returns Promise that resolves when concatenation is complete
 */
export function concatAudioFiles(
  inputFiles: string[],
  outputFile: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (inputFiles.length < 2) {
      return reject(
        new Error('Need at least two files to concatenate.')
      );
    }
    const fileList = inputFiles
      .map((f) => `file '${path.resolve(f)}'`)
      .join('\n');
    const tmpListPath = path.join(
      path.dirname(outputFile),
      'ffmpeg_concat_list.txt'
    );
    fs.writeFileSync(tmpListPath, fileList);

    ffmpeg()
      .input(tmpListPath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions(['-c', 'copy'])
      .on('end', () => {
        fs.unlinkSync(tmpListPath);
        resolve();
      })
      .on('error', (err: unknown) => {
        fs.unlinkSync(tmpListPath);
        reject(err);
      })
      .save(outputFile);
  });
}

declare module 'fluent-ffmpeg';
