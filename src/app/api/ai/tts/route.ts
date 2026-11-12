import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig } from '@/lib/site-config-store';

export const dynamic = 'force-dynamic';

/**
 * Wraps raw 16-bit signed PCM audio bytes (24000 Hz, 1 channel) from Gemini API
 * into a standard RIFF WAVE (.wav) buffer that any browser <audio> tag can play.
 */
function pcmToWavBuffer(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Splits text into natural sentence chunks <= 190 chars for cloud neural TTS fallback.
 */
function splitTextIntoChunks(text: string, maxLen = 185): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        // Hard split by words if a single sentence exceeds maxLen
        const words = trimmed.split(' ');
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).trim().length <= maxLen) {
            sub = (sub + ' ' + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        current = sub;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.slice(0, 6);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = String(body.text || '').trim();
    const voiceName = String(body.voiceName || 'Aoede').trim(); // 'Aoede' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir'
    const apiKeyOverride = String(body.apiKeyOverride || '').trim();

    if (!rawText) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const cleanText = rawText
      .replace(/[*#_~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 700);

    const config: any = readSiteConfig();
    const activeApiKey =
      apiKeyOverride || config.geminiApiKey || process.env.GEMINI_API_KEY || '';

    // =========================================================================
    // 1. PRIORITY 1: GEMINI NATIVE AUDIO / TTS (Aoede, Kore, Puck, Charon, Fenrir)
    // =========================================================================
    if (activeApiKey) {
      const geminiModels = [
        'gemini-2.5-flash-preview-tts',
        'gemini-2.0-flash-exp',
      ];

      for (const modelName of geminiModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
            activeApiKey
          )}`;

          const geminiPayload = {
            contents: [
              {
                parts: [
                  {
                    text:
                      modelName.includes('tts')
                        ? `Speak warmly and naturally like an encouraging English teacher: ${cleanText}`
                        : `Read the following sentences aloud warmly and clearly without adding any extra words: "${cleanText}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: ['Aoede', 'Kore', 'Puck', 'Charon', 'Fenrir'].includes(
                      voiceName
                    )
                      ? voiceName
                      : 'Aoede',
                  },
                },
              },
            },
          };

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 9000);

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload),
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (res.ok) {
            const data = await res.json();
            const parts = data?.candidates?.[0]?.content?.parts || [];
            const audioPart = parts.find(
              (p: any) =>
                p?.inlineData?.data &&
                String(p?.inlineData?.mimeType || '').startsWith('audio/')
            );

            if (audioPart?.inlineData?.data) {
              const mimeType = String(audioPart.inlineData.mimeType || 'audio/pcm');
              const rawBytes = Buffer.from(audioPart.inlineData.data, 'base64');

              if (mimeType.includes('wav')) {
                return new NextResponse(new Uint8Array(rawBytes), {
                  status: 200,
                  headers: {
                    'Content-Type': 'audio/wav',
                    'X-Voice-Engine': `gemini-${modelName}-${voiceName}`,
                    'Cache-Control': 'no-store',
                  },
                });
              }

              // Convert 24kHz 16-bit PCM to WAV
              const wavBuffer = pcmToWavBuffer(rawBytes, 24000, 1, 16);
              return new NextResponse(new Uint8Array(wavBuffer), {
                status: 200,
                headers: {
                  'Content-Type': 'audio/wav',
                  'X-Voice-Engine': `gemini-${modelName}-${voiceName}`,
                  'Cache-Control': 'no-store',
                },
              });
            }
          }
        } catch (err) {
          console.warn(`Gemini TTS (${modelName}) fallback:`, err);
        }
      }
    }

    // =========================================================================
    // 2. PRIORITY 2: GOOGLE CLOUD / TRANSLATE NEURAL VOICE STREAM (MP3)
    //    Produces natural Google US English Female voice (same family as Gemini/Assistant)
    // =========================================================================
    try {
      const chunks = splitTextIntoChunks(cleanText, 180);
      const mp3Buffers: Buffer[] = [];

      for (const chunk of chunks) {
        const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-US&q=${encodeURIComponent(
          chunk
        )}`;
        const res = await fetch(ttsUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
        });
        if (res.ok) {
          const arrBuf = await res.arrayBuffer();
          if (arrBuf.byteLength > 200) {
            mp3Buffers.push(Buffer.from(arrBuf));
          }
        }
      }

      if (mp3Buffers.length > 0) {
        const combinedMp3 = Buffer.concat(mp3Buffers);
        return new NextResponse(new Uint8Array(combinedMp3), {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'X-Voice-Engine': 'google-neural-voice',
            'Cache-Control': 'no-store',
          },
        });
      }
    } catch (err) {
      console.warn('Google Neural TTS stream fallback error:', err);
    }

    return NextResponse.json(
      { error: 'Cloud neural TTS unavailable, use client neural voice' },
      { status: 503 }
    );
  } catch (err) {
    console.error('TTS API error:', err);
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
  }
}
