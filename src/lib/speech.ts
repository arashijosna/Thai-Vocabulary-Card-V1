// 泰文語音朗讀（TTS）與語音辨識（STT）工具

export function speakThai(text: string, rate: number, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  utterance.rate = rate;
  const thVoice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith('th'));
  if (thVoice) utterance.voice = thVoice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// SpeechRecognition 型別宣告（瀏覽器未標準化）
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

/** 將泰文文字正規化以便比對：移除標點、空白、重複的敬語詞 */
export function normalizeThai(text: string): string {
  return text
    .replace(/[\s\u00A0]+/g, '')
    .replace(/[.,!?;:、。！？；：（）()"'“”‘’/\\-]/g, '')
    .trim();
}

export interface DiffResult {
  isMatch: boolean;
  /** 逐字比對後的結果，用於標示差異 */
  matched: boolean[];
}

/** 逐字比對系統聽到的泰文與正確答案（已正規化） */
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
