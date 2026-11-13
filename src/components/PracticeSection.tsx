import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import type { Flashcard } from '../data/cards';
import {
  createThaiRecognition,
  isSpeechRecognitionSupported,
  compareThai,
  normalizeThai,
} from '../lib/speech';

interface Props {
  card: Flashcard;
}

interface PracticeResult {
  heard: string;
  diff: boolean[];
  isMatch: boolean;
}

type PracticeState = 'idle' | 'listening' | 'processing' | 'done' | 'error';

export default function PracticeSection({ card }: Props) {
  const [supported] = useState(isSpeechRecognitionSupported);
  const [state, setState] = useState<PracticeState>('idle');
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef<ReturnType<typeof createThaiRecognition>>(null);

  useEffect(() => {
    setResult(null);
    setState('idle');
    setErrorMsg('');
    stopIfRunning();
    return stopIfRunning;
  }, [card.id]);

  function stopIfRunning() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }

  function startPractice() {
    if (state === 'listening') {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = createThaiRecognition();
    if (!recognition) {
      setErrorMsg('很抱歉，你的瀏覽器不支援語音辨識，建議使用 Chrome 瀏覽器開啟本頁面。');
      setState('error');
      return;
    }
    recognitionRef.current = recognition;
    setResult(null);
    setErrorMsg('');
    setState('listening');

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0]?.transcript ?? '';
      }
      finalTranscript = transcript;
    };

    recognition.onerror = (event) => {
      const code = event?.error;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setErrorMsg('無法使用麥克風，請在手機或瀏覽器設定中允許使用麥克風。');
      } else if (code === 'no-speech') {
        setErrorMsg('沒有聽到聲音，請再靠近麥克風說一次。');
      } else if (code === 'network') {
        setErrorMsg('語音辨識需要網路連線，請確認網路後再試。');
      } else {
        setErrorMsg('語音辨識發生問題，請再試一次。');
      }
      setState('error');
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (finalTranscript) {
        setState('processing');
        finish(finalTranscript);
      } else {
        setState('idle');
      }
    };

    recognition.start();
  }

  function finish(heard: string) {
    const diff = compareThai(card.thai, heard);
    setState('done');
    setResult({
      heard,
      diff: diff.matched,
      isMatch: diff.isMatch,
    });
  }

  const isListening = state === 'listening';

  return (
    <div className="mt-5 rounded-2xl bg-white/70 border border-amber-900/10 p-4">
      <p className="text-sm text-stone-500 mb-3 font-medium">發音練習</p>

      <button
        onClick={startPractice}
        disabled={!supported}
        className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold text-white shadow-md transition-all duration-200 active:scale-95 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 shadow-red-200 animate-pulse'
            : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
        } disabled:bg-stone-300 disabled:shadow-none disabled:cursor-not-allowed`}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5" />
            點擊停止聆聽
          </>
        ) : state === 'processing' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            辨識中...
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            按住或點擊開始練習發音
          </>
        )}
      </button>

      {!supported && (
        <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            很抱歉，你的瀏覽器不支援語音辨識，建議使用 Chrome 瀏覽器開啟本頁面。
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {state === 'done' && result && (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-stone-500">
            系統聽到的泰文：
            <span className="ml-1 text-stone-800 font-semibold" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
              {result.heard || '（空）'}
            </span>
          </div>

          {result.isMatch ? (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3.5">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <div>
                <p className="text-green-700 font-bold">發音標準！</p>
                <p className="text-sm text-green-600">太棒了，繼續保持！</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
                <p className="text-orange-700 font-bold">有點不太一樣，再試一次！</p>
              </div>
              <p className="text-sm text-stone-600 mb-1.5">逐字比對（綠色＝正確，紅色＝有差異）：</p>
              <p className="text-2xl leading-relaxed tracking-wide" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
                {normalizeThai(card.thai).split('').map((ch, i) => (
                  <span
                    key={i}
                    className={
                      result.diff[i]
                        ? 'text-green-700'
                        : 'text-red-600 underline decoration-red-400 decoration-2 underline-offset-4'
                    }
                  >
                    {ch}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
