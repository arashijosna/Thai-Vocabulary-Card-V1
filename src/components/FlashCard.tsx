import { useState } from 'react';
import { Volume2, Repeat, BookA } from 'lucide-react';
import type { Flashcard } from '../data/cards';
import { speakThai } from '../lib/speech';

interface Props {
  card: Flashcard;
  rate: number;
}

export default function FlashCard({ card, rate }: Props) {
  const [flipped, setFlipped] = useState(false);

  function handleSpeak(e: React.MouseEvent) {
    e.stopPropagation();
    speakThai(card.thai, rate);
  }

  return (
    <div
      className="w-full cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '300px',
        }}
      >
        {/* 正面：泰文與羅馬拼音 */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white shadow-lg shadow-amber-900/5 border border-amber-900/10 p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <button
            onClick={handleSpeak}
            aria-label="聽發音"
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-700 px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-orange-200 active:scale-90"
          >
            <Volume2 className="w-4 h-4" />
            聽發音
          </button>
          <p
            className="text-4xl font-semibold text-stone-800 text-center leading-relaxed"
            style={{ fontFamily: "'Noto Sans Thai', 'Segoe UI', sans-serif" }}
          >
            {card.thai}
          </p>
          <p className="mt-4 text-lg text-stone-500 tracking-wide">{card.romanization}</p>
          {card.zhuyin && (
            <p className="mt-2 flex items-center gap-1.5 rounded-full bg-amber-900/5 px-4 py-1.5 text-base text-stone-600">
              <BookA className="w-4 h-4 text-orange-500 shrink-0" />
              {card.zhuyin}
            </p>
          )}
          <div className="absolute bottom-4 flex items-center gap-1.5 text-xs text-stone-400">
            <Repeat className="w-3.5 h-3.5" />
            點擊卡片看中文意思
          </div>
        </div>

        {/* 背面：繁體中文意思與例句 */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-orange-50 shadow-lg shadow-amber-900/5 border border-orange-200 p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <button
            onClick={handleSpeak}
            aria-label="聽發音"
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-700 px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-orange-200 active:scale-90"
          >
            <Volume2 className="w-4 h-4" />
            聽發音
          </button>
          <p className="text-2xl font-bold text-stone-800 text-center">{card.chinese}</p>
          <div className="mt-5 w-full rounded-2xl bg-white/80 p-4 border border-orange-100">
            <p
              className="text-xl text-stone-800 text-center leading-relaxed"
              style={{ fontFamily: "'Noto Sans Thai', 'Segoe UI', sans-serif" }}
            >
              {card.example}
            </p>
            <p className="mt-2 text-sm text-stone-500 text-center leading-relaxed">
              {card.exampleChinese}
            </p>
          </div>
          <div className="absolute bottom-4 flex items-center gap-1.5 text-xs text-stone-400">
            <Repeat className="w-3.5 h-3.5" />
            點擊卡片翻回泰文
          </div>
        </div>
      </div>
    </div>
  );
}
