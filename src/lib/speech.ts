export function speakThai(text: string, rate: number, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) return;

  // 取消先前的語音
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  utterance.rate = rate;

  // 確保載入聲音
  const thVoice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith('th'));

  if (thVoice) {
    utterance.voice = thVoice;
  }

  // 修正：補上原本遺失的右大括號，確保後續程式能正常執行
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  // 修正：加上 50ms 微小延遲，避免 iOS Safari 將 cancel() 作用到這次新的發音上
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 50);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// --- 下方保留原本 PracticeSection 用到的語音辨識程式碼 ---

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function createThaiRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w.SpeechRecognition || w.webkitSpeechRecognition) as
    | SpeechRecognitionCtor
    | undefined;

  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = 'th-TH';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;
  return recognition;
}

export function normalizeThai(text: string): string {
  return text
    .replace(/[\s\u00A0]+/g, '')
    .replace(/[.,!?;: ()"'/\\-]/g, '')
    .trim();
}

export interface DiffResult {
  isMatch: boolean;
  matched: boolean[];
}

export function compareThai(expected: string, heard: string): DiffResult {
  const exp = normalizeThai(expected);
  const got = normalizeThai(heard);

  const matched: boolean[] = [];
  let isMatch = true;

  for (let i = 0; i < exp.length; i++) {
    const ok = got[i] === exp[i];
    matched.push(ok);
    if (!ok) isMatch = false;
  }

  if (got.length > exp.length) isMatch = false;

  return { isMatch, matched };
}
