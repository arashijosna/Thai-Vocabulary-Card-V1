import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Check, X, AlertCircle, Loader2 } from 'lucide-react';
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
type TargetType = 'word' | 'example';

export default function PracticeSection({ card }: Props) {
  const [supported] = useState(isSpeechRecognitionSupported);
  const [state, setState] = useState<PracticeState>('idle');
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [target, setTarget] = useState<TargetType>('word'); // 新增目標切換
  const recognitionRef = useRef<ReturnType<typeof createThaiRecognition>>(null);

  // 當卡片切換時，重置所有狀態
  useEffect(() => {
    setResult(null);
    setState('idle');
    setErrorMsg('');
    setTarget('word'); // 預設切回單字
    stopIfRunning();
    return stopIfRunning;
  }, [card.id]);

  // 當切換練習目標時，重置結果
  useEffect(() => {
    setResult(null);
    setState('idle');
    setErrorMsg('');
    stopIfRunning();
  }, [target]);

  function stopIfRunning() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }

  // 決定當下要比對的文字是單字還是例句
  const targetText = target === 'word' ? card.thai : card.example;

  function startPractice() {
    if (state === 'listening') {
      recognitionRef.current?.stop();
      return;
    }
    if (!targetText) return;

    const recognition = createThaiRecognition();
    if (!recognition) {
      setErrorMsg('你的瀏覽器不支援語音辨識，請使用 Chrome 或 Edge。');
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
        setErrorMsg('請允許麥克風權限以進行練習。');
      } else if (code === 'no-speech') {
        setErrorMsg('沒有偵測到聲音，請再試一次。');
      } else if (code === 'network') {
        setErrorMsg('網路連線錯誤，請檢查網路狀態。');
      } else {
        setErrorMsg('發生未知的錯誤，請重試。');
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
    // 傳入正確的目標字串進行比對
    const diff = compareThai(targetText, heard);
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
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-stone-500 font-medium">發音練習</p>
        
        {/* 新增切換按鈕 (只有當例句存在時才顯示) */}
        {card.example && (
          <div className="flex bg-stone-100 rounded-lg p-0.5">
            <button
              onClick={() => setTarget('word')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                target === 'word' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              單字
            </button>
            <button
              onClick={() => setTarget('example')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                target === 'example' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              例句
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={startPractice}
        disabled={!supported || !targetText}
        className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold text-white shadow-md transition-all duration-200 active:scale-95 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 shadow-red-200 animate-pulse'
            : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
        } disabled:bg-stone-300 disabled:shadow-none disabled:cursor-not-allowed`}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5" />
            聆聽中...點擊停止
          </>
        ) : state === 'processing' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            辨識中...
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            開始練習 ({target === 'word' ? '單字' : '例句'})
          </>
        )}
      </button>

      {!supported && (
        <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            你的瀏覽器可能不支援語音辨識功能，建議使用 Chrome 或 Edge 瀏覽器。
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
            你說的是：
            <span className="ml-1 text-stone-800 font-semibold" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
              {result.heard || '沒有聽清楚'}
            </span>
          </div>

          {result.isMatch ? (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3.5">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <div>
                <p className="text-green-700 font-bold">太棒了！</p>
                <p className="text-sm text-green-600">發音非常準確</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
                <p className="text-orange-700 font-bold">再試一次！</p>
              </div>
              <p className="text-sm text-stone-600 mb-1.5">紅色部分需要再加強：</p>
              <p className="text-2xl leading-relaxed tracking-wide" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
                {normalizeThai(targetText).split('').map((ch, i) => (
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
