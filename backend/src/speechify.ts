import { Speechify } from '@speechify/api-sdk';
import 'dotenv/config';

const API_KEY = process.env.SPEECHIFY_API_KEY;
// Speechify /speech endpoint: 2,000 char limit (including SSML)
const CHAR_LIMIT = 2000;

if (!API_KEY) throw new Error('SPEECHIFY_API_KEY not set');

const speechify = new Speechify({ apiKey: API_KEY });

function chunkText(text: string, limit: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + limit));
    i += limit;
  }
  return chunks;
}

export type VoiceId =
  | 'bwyneth' // female
  | 'carly' // female
  | 'kristy' // female
  | 'tasha' // female
  | 'lisa' // female
  | 'emily' // female
  | 'julie' // female
  | 'erin' // female
  | 'lindsey' // female
  | 'monica' // female (default)
  | 'stacy' // female
  | 'evelyn' // female
  | 'victoria' // female
  | 'christina' // female
  | 'lauren' // female
  | 'patricia' // female
  | 'jennifer' // female
  | 'sarah' // female
  | 'karen' // female
  | 'amanda' // female
  | 'melissa' // female
  | 'rebecca' // female
  | 'sharon' // female
  | 'cynthia' // female
  | 'kathleen' // female
  | 'joan' // female
  | 'shirley' // female
  | 'angela' // female
  | 'anna' // female
  | 'brenda' // female
  | 'pamela' // female
  | 'samantha' // female
  | 'katherine' // female
  | 'christine' // female
  | 'debra' // female
  | 'catherine' // female
  | 'carolyn' // female
  | 'janet' // female
  | 'ruth' // female
  | 'heather' // female
  | 'diane' // female
  | 'virginia' // female
  | 'judith' // female
  | 'kelly' // female
  | 'terry' // female
  | 'kathy' // female
  | 'rose' // female
  | 'ava' // female
  | 'bonnie' // female
  | 'peggy' // female
  | 'ruby' // female
  | 'crystal' // female
  | 'norma' // female
  | 'paula' // female
  | 'annie' // female
  | 'lillian' // female
  | 'robin' // female
  | 'lucy' // female
  | 'april' // female
  | 'anne' // female
  | 'tammy' // female
  | 'eleanor' // female
  | 'regina' // female
  | 'carly' // female
  | 'beth' // female
  | 'dawn' // female
  | 'wendy' // female
  | 'florence' // female
  | 'tracy' // female
  | 'phillis' // female
  | 'carole' // female
  | 'mildred' // female
  | 'connie' // female
  | 'gladys' // female
  | 'arlene' // female
  | 'jana' // female
  | 'leona' // female
  | 'miriam' // female
  | 'velma' // female
  | 'susanne' // female
  | 'corinne' // female
  | 'lana' // female
  | 'cherry' // female
  | 'claire' // female
  | 'vivian' // female
  | 'daisy' // female
  | 'ella' // female
  | 'george' // male
  | 'oliver' // male
  | 'joe' // male
  | 'mark' // male
  | 'nick' // male
  | 'jack' // male
  | 'jesse' // male
  | 'keenan' // male
  | 'jacob' // male
  | 'james' // male
  | 'mason' // male
  | 'matthew' // male
  | 'brian' // male
  | 'anthony' // male
  | 'donald' // male
  | 'paul' // male
  | 'steven' // male
  | 'andrew' // male
  | 'kenneth' // male
  | 'joshua' // male
  | 'samuel' // male
  | 'gregory' // male
  | 'frank' // male
  | 'alexander' // male
  | 'raymond' // male
  | 'patrick' // male
  | 'bruce' // male
  | 'bobby' // male
  | 'johnny' // male
  | 'bradley' // male
  | 'dale' // male
  | 'howard' // male
  | 'fred' // male
  | 'blake' // male
  | 'dennis' // male
  | 'jerry' // male
  | 'tyler' // male
  | 'aaron' // male
  | 'larry' // male
  | 'keith' // male
  | 'scott' // male
  | 'curtis' // male
  | 'todd' // male
  | 'leonard' // male
  | 'calvin' // male
  | 'edwin' // male
  | 'don' // male
  | 'craig' // male
  | 'danny' // male
  | 'stanley' // male
  | 'jeffery' // male
  | 'herbert' // male
  | 'lee' // male
  | 'trevor' // male
  | 'brendan' // male
  | 'toby' // male
  | 'van' // male
  | 'myron' // male
  | 'boyd' // male
  | 'joel' // male
  | 'earl' // male
  | 'brett' // male
  | 'edna' // male
  | 'steve' // male
  | 'jon' // male
  | 'bob' // male
  | 'jim' // male
  | 'matt' // male
  | 'lyle' // male
  | 'hubert' // male
  | 'kenny' // male
  | 'doug' // male
  | 'sammy' // male
  | 'homer' // male
  | 'wendell' // male
  | 'woodrow' // male
  | 'felipe' // male
  | 'garry' // male
  | 'pete' // male
  | 'marco' // male
  | 'rufus' // male
  | 'owen' // male
  | 'bryant' // male
  | 'abraham' // male
  | 'irving' // male
  | 'jermaine' // male
  | 'julius' // male
  | 'marty' // male
  | 'russell' // male
  | 'benjamin' // male
  | 'michael' // male
  | 'collin' // male
  | 'phil' // male
  | 'archie' // male
  | 'freddie' // male
  | 'harper' // male
  | 'austin' // male
  | 'derek' // male
  | 'ellis' // male
  | 'ian' // male
  | 'oscar'; // male;

export interface TTSOptions {
  input: string;
  voiceId?: VoiceId;
  audioFormat?: 'mp3' | 'wav';
}

export interface TTSGenerator {
  convertTextToSpeech(
    text: string,
    options?: TTSOptions
  ): Promise<Buffer>;
}

export async function convertTextToSpeech(
  text: string,
  options?: TTSOptions
): Promise<Buffer> {
  const voiceId: VoiceId = options?.voiceId || 'monica';
  const audioFormat = options?.audioFormat || 'mp3';
  const chunks = chunkText(text, CHAR_LIMIT);
  const audioBuffers: Buffer[] = [];
  for (const chunk of chunks) {
    const response = await speechify.audioGenerate({
      input: chunk,
      voiceId,
      audioFormat,
    });
    const arrayBuffer = await response.audioData.arrayBuffer();
    audioBuffers.push(Buffer.from(arrayBuffer));
  }
  return Buffer.concat(audioBuffers);
}
