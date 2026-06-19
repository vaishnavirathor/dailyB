// ============================================================
// Daily Bread — HD voice edge function (multi-provider TTS)
//
// POST { text, lang: 'te'|'en', provider?: 'azure'|'sarvam'|'elevenlabs',
//        gender?: 'female'|'male' }
// → { url } — public URL of the synthesized MP3/WAV, served from the
//   'tts-cache' storage bucket (each utterance synthesized exactly once
//   globally, then cached forever).
//
// Setup:
//   1. supabase functions deploy tts
//   2. Storage → create PUBLIC bucket: tts-cache
//   3. supabase secrets set (only the providers you use):
//        TTS_DEFAULT_PROVIDER=azure
//        AZURE_SPEECH_KEY=…           AZURE_SPEECH_REGION=centralindia
//        SARVAM_API_KEY=…
//        ELEVENLABS_API_KEY=…
//        ELEVEN_VOICE_TE=<voice id>   ELEVEN_VOICE_EN=<voice id>
//          (ElevenLabs voice ids — e.g. your cloned pastor voice)
// ============================================================
import { createClient } from 'jsr:@supabase/supabase-js@2';

type Lang = 'te' | 'en';
type Provider = 'azure' | 'sarvam' | 'elevenlabs';
type Gender = 'female' | 'male';

const BUCKET = 'tts-cache';

const AZURE_VOICES: Record<Lang, Record<Gender, string>> = {
  te: { female: 'te-IN-ShrutiNeural', male: 'te-IN-MohanNeural' },
  en: { female: 'en-IN-NeerjaNeural', male: 'en-IN-PrabhatNeural' },
};

const SARVAM_SPEAKERS: Record<Lang, Record<Gender, string>> = {
  te: { female: 'tanya', male: 'gokul' },
  en: { female: 'tanya', male: 'gokul' },
};

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function xmlEscape(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function synthAzure(text: string, lang: Lang, gender: Gender): Promise<Uint8Array> {
  const key = Deno.env.get('AZURE_SPEECH_KEY');
  const region = Deno.env.get('AZURE_SPEECH_REGION') ?? 'centralindia';
  if (!key) {
    throw new Error('AZURE_SPEECH_KEY not set');
  }
  const voice = AZURE_VOICES[lang][gender];
  const locale = lang === 'te' ? 'te-IN' : 'en-IN';
  const ssml = `<speak version="1.0" xml:lang="${locale}"><voice name="${voice}"><prosody rate="-6%">${xmlEscape(text)}</prosody></voice></speak>`;
  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'daily-bread-tts',
    },
    body: ssml,
  });
  if (!response.ok) {
    throw new Error(`azure ${response.status}: ${await response.text()}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function synthSarvam(text: string, lang: Lang, gender: Gender): Promise<Uint8Array> {
  const key = Deno.env.get('SARVAM_API_KEY');
  if (!key) {
    throw new Error('SARVAM_API_KEY not set');
  }
  const response = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: { 'api-subscription-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: lang === 'te' ? 'te-IN' : 'en-IN',
      speaker: SARVAM_SPEAKERS[lang][gender],
      model: 'bulbul:v3',
      pace: 0.99,
      speech_sample_rate: 22050,
      output_audio_codec: 'mp3',
      enable_preprocessing: true,
    }),
  });
  if (!response.ok) {
    throw new Error(`sarvam ${response.status}: ${await response.text()}`);
  }
  const json = (await response.json()) as { audios: string[] };
  const base64 = json.audios?.[0];
  if (!base64) {
    throw new Error('sarvam: empty audio');
  }
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function synthElevenLabs(text: string, lang: Lang): Promise<Uint8Array> {
  const key = Deno.env.get('ELEVENLABS_API_KEY');
  const voiceId = Deno.env.get(lang === 'te' ? 'ELEVEN_VOICE_TE' : 'ELEVEN_VOICE_EN');
  if (!key || !voiceId) {
    throw new Error('ELEVENLABS_API_KEY / ELEVEN_VOICE_* not set');
  }
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
    {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
    },
  );
  if (!response.ok) {
    throw new Error(`elevenlabs ${response.status}: ${await response.text()}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

Deno.serve(async (request) => {
  try {
    if (request.method !== 'POST') {
      return new Response('method not allowed', { status: 405 });
    }
    const { text, lang, provider, gender } = (await request.json()) as {
      text?: string;
      lang?: Lang;
      provider?: Provider;
      gender?: Gender;
    };
    if (!text || text.length === 0 || text.length > 1200 || (lang !== 'te' && lang !== 'en')) {
      return Response.json({ error: 'bad request' }, { status: 400 });
    }
    const chosenProvider: Provider =
      provider ?? ((Deno.env.get('TTS_DEFAULT_PROVIDER') as Provider | undefined) ?? 'azure');
    const chosenGender: Gender = gender === 'male' ? 'male' : 'female';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Global cache: each utterance is synthesized exactly once.
    const ext = 'mp3';
    const hash = await sha256Hex(`${chosenProvider}:${chosenGender}:${lang}:${text}`);
    const path = `${chosenProvider}/${lang}/${hash}.${ext}`;
    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

    const existing = await supabase.storage
      .from(BUCKET)
      .list(`${chosenProvider}/${lang}`, { search: `${hash}.${ext}`, limit: 1 });
    if (!existing.error && existing.data.length > 0) {
      return Response.json({ url: publicUrl, cached: true });
    }

    const audio =
      chosenProvider === 'azure'
        ? await synthAzure(text, lang, chosenGender)
        : chosenProvider === 'sarvam'
          ? await synthSarvam(text, lang, chosenGender)
          : await synthElevenLabs(text, lang);

    const upload = await supabase.storage.from(BUCKET).upload(path, audio, {
      contentType: ext === 'mp3' ? 'audio/mpeg' : 'audio/wav',
      upsert: true,
    });
    if (upload.error) {
      throw upload.error;
    }

    return Response.json({ url: publicUrl, cached: false });
  } catch (error) {
    console.error('[tts]', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
});
