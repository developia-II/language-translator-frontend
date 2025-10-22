// // Client-side local MMS-TTS loader (Igbo/Hausa) using Transformers.js
// // Expects converted Xenova-format models to be placed under public/models/
// // Example directories:
// //   public/models/mms-tts-ibo
// //   public/models/mms-tts-hau

// import { pipeline, env } from '@xenova/transformers';

// // Enable loading models from the app's public/ path
// env.allowLocalModels = true;
// env.useBrowserCache = true;

// type TTSPipeline = (text: string) => Promise<{ audio: Float32Array; sampling_rate: number }>;
// const ttsCache: Record<string, Promise<TTSPipeline>> = {};

// function langToModelSuffix(langBase: string): string {
//   const base = langBase.toLowerCase();
//   if (base === 'ig') return 'ibo';
//   if (base === 'ha') return 'hau';
//   if (base === 'yo') return 'yor';
//   return base;
// }

// async function getLocalSynth(langBase: string): Promise<TTSPipeline> {
//   const suffix = langToModelSuffix(langBase);
//   const modelPath = `/models/mms-tts-${suffix}`;
//   if (!ttsCache[modelPath]) {
//     ttsCache[modelPath] = pipeline('text-to-speech', modelPath, { quantized: false }) as Promise<TTSPipeline>;
//   }
//   return ttsCache[modelPath];
// }

// function floatToWavBlob(float32: Float32Array, sampleRate: number): Blob {
//   const buffer = new ArrayBuffer(44 + float32.length * 2);
//   const view = new DataView(buffer);

//   const writeString = (offset: number, str: string) => {
//     for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
//   };

//   const pcm16 = new Int16Array(float32.length);
//   for (let i = 0; i < float32.length; i++) {
//     const s = Math.max(-1, Math.min(1, float32[i]));
//     pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
//   }

//   const channels = 1;
//   const bytesPerSample = 2;
//   const blockAlign = channels * bytesPerSample;
//   const byteRate = sampleRate * blockAlign;

//   writeString(0, 'RIFF');
//   view.setUint32(4, 36 + pcm16.length * 2, true);
//   writeString(8, 'WAVE');
//   writeString(12, 'fmt ');
//   view.setUint32(16, 16, true);
//   view.setUint16(20, 1, true);
//   view.setUint16(22, channels, true);
//   view.setUint32(24, sampleRate, true);
//   view.setUint32(28, byteRate, true);
//   view.setUint16(32, blockAlign, true);
//   view.setUint16(34, 16, true);
//   writeString(36, 'data');
//   view.setUint32(40, pcm16.length * 2, true);

//   let offset = 44;
//   for (let i = 0; i < pcm16.length; i++, offset += 2) {
//     view.setInt16(offset, pcm16[i], true);
//   }

//   return new Blob([view], { type: 'audio/wav' });
// }

// export async function playLocalMMS(text: string, langBase: string): Promise<void> {
//   if (typeof window === 'undefined') throw new Error('local-tts must run on client');
//   const synth = await getLocalSynth(langBase);
//   const output = await synth(text);
//   const blob = floatToWavBlob(output.audio, output.sampling_rate);
//   const url = URL.createObjectURL(blob);
//   const audio = new Audio(url);
//   try {
//     await audio.play();
//   } finally {
//     audio.onended = () => URL.revokeObjectURL(url);
//   }
// }
