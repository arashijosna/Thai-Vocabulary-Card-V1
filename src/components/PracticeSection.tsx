import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Check, X, AlertCircle, Loader2, Volume2 } from 'lucide-react';
import type { Flashcard } from '../data/cards';
import {
  createThaiRecognition,
  isSpeechRecognitionSupported,
  compareThai,
  normalizeThai,
  speakThai, // 引入發音功能
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
  const [target, setTarget] = useState<TargetType>('word');
  const recognitionRef = useRef<ReturnType<typeof createThaiRecognition>>(null);

  useEffect(() => {
    setResult(null);
    setState('idle');
    setErrorMsg('');
    setTarget('word');
    stopIfRunning();
    return stopIfRunning;
  }, [card.id]);

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
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
                <p className="text-orange-700 font-bold">再試一次！</p>
              </div>

              <p className="text-sm text-stone-600 mb-1.5">沒有辨識成功的字：</p>
              <p className="text-2xl leading-relaxed tracking-wide mb-4" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
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

              {/* 顯示拼音與注音 (針對單字) */}
              {target === 'word' && (card.romanization || card.zhuyin) && (
                <div className="mb-4 p-3 bg-white/70 rounded-lg text-sm text-stone-700 border border-orange-100">
                  <p className="font-bold text-orange-800 mb-1.5">📍 發音參考</p>
                  {card.romanization && <p className="mb-0.5">拼音：<span className="font-medium">{card.romanization}</span></p>}
                  {card.zhuyin && <p>注音：<span className="font-medium">{card.zhuyin}</span></p>}
                </div>
              )}

              {/* 錯誤引導與聽發音按鈕 */}
              <div className="text-xs text-stone-500 space-y-2 mb-4">
                <p>💡 <strong>常見發音盲點：</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>聲調錯誤：</strong> 泰語有 5 個聲調，聲調不對會變成別的字。</li>
                  <li><strong>長短音：</strong> 檢查母音有沒有拉得太長或太短。</li>
                  <li><strong>尾音：</strong> 泰語結尾的音（如 k, p, t, m, n, ng）要發得很輕或閉住。</li>
                </ul>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakThai(targetText, 1.0);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-3 py-2.5 text-sm font-bold shadow-sm transition-colors active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                聽標準發音
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
