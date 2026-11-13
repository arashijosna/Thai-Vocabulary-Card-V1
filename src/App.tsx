import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  Turtle,
  Gauge,
  Trash2,
} from 'lucide-react';
import FlashCard from './components/FlashCard';
import PracticeSection from './components/PracticeSection';
import AddCardModal from './components/AddCardModal';
import ImportCardsModal from './components/ImportCardsModal';
import { DEFAULT_CARDS, type Flashcard, type CardInput } from './data/cards';
import { loadCustomCards, saveCustomCards, makeId } from './lib/storage';
import { stopSpeaking } from './lib/speech';

export default function App() {
  const [customCards, setCustomCards] = useState<Flashcard[]>(() => loadCustomCards());
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const allCards = useMemo(() => [...DEFAULT_CARDS, ...customCards], [customCards]);
  const card = allCards[Math.min(index, allCards.length - 1)];

  useEffect(() => {
    stopSpeaking();
  }, [index]);

  function goTo(newIndex: number) {
    setIndex(Math.max(0, Math.min(allCards.length - 1, newIndex)));
  }

  function addCard(data: CardInput) {
    const newCard: Flashcard = { id: makeId(), custom: true, ...data };
    const next = [...customCards, newCard];
    setCustomCards(next);
    saveCustomCards(next);
    setIndex(allCards.length); // 跳到新卡片
  }

  function importCards(data: CardInput[]) {
    const newCards: Flashcard[] = data.map((d) => ({
      id: makeId(),
      custom: true,
      ...d,
    }));
    const next = [...customCards, ...newCards];
    setCustomCards(next);
    saveCustomCards(next);
    setIndex(allCards.length); // 跳到第一張新卡片
  }

  function deleteCustomCard(id: string) {
    const removedIndex = allCards.findIndex((c) => c.id === id);
    const next = customCards.filter((c) => c.id !== id);
    setCustomCards(next);
    saveCustomCards(next);
    if (removedIndex !== -1 && removedIndex <= index) {
      setIndex((i) => Math.max(0, i - 1));
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-stone-800">
      <div className="mx-auto max-w-md px-4 pt-6 pb-10">
        {/* 頂部標題 */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">泰文字卡學習</h1>
            <p className="text-xs text-stone-500 mt-0.5">สวัสดี ・ 每天學一點泰文</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportOpen(true)}
              aria-label="批次匯入單字"
              className="flex items-center gap-1.5 rounded-full bg-white border border-amber-900/15 text-stone-700 px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-orange-50 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              匯入
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-orange-500 text-white px-4 py-2.5 text-sm font-bold shadow-md shadow-orange-200 transition hover:bg-orange-600 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              新增字卡
            </button>
          </div>
        </header>

        {/* 進度條 */}
        <div className="mb-2">
          <div className="h-2 rounded-full bg-amber-900/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-300"
              style={{ width: `${((index + 1) / allCards.length) * 100}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-stone-500">
            <span>
              第 {index + 1} 張 / 共 {allCards.length} 張
            </span>
            {card?.custom && (
              <button
                onClick={() => deleteCustomCard(card.id)}
                className="flex items-center gap-1 text-red-400 hover:text-red-600 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                刪除這張字卡
              </button>
            )}
          </div>
        </div>

        {/* 字卡 */}
        {card ? (
          <FlashCard card={card} rate={rate} />
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center text-stone-500">
            還沒有任何字卡
          </div>
        )}

        {/* 上一張 / 下一張 */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="上一張"
            className="flex items-center gap-1.5 rounded-full bg-white border border-amber-900/10 px-5 py-3 font-semibold text-stone-700 shadow-sm transition hover:bg-orange-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            上一張
          </button>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index >= allCards.length - 1}
            aria-label="下一張"
            className="flex items-center gap-1.5 rounded-full bg-orange-500 px-6 py-3 font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下一張
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 語速切換 */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-xs text-stone-500 mr-1">朗讀語速</span>
          <div className="flex rounded-full bg-white border border-amber-900/10 p-1 shadow-sm">
            <button
              onClick={() => setRate(1.0)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                rate === 1.0
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-stone-600 hover:bg-orange-50'
              }`}
            >
              <Gauge className="w-4 h-4" />
              正常語速 1.0x
            </button>
            <button
              onClick={() => setRate(0.7)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                rate === 0.7
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-stone-600 hover:bg-orange-50'
              }`}
            >
              <Turtle className="w-4 h-4" />
              慢速播放 0.7x
            </button>
          </div>
        </div>

        {/* 發音練習 */}
        {card && <PracticeSection card={card} />}

        <p className="mt-8 text-center text-xs text-stone-400 leading-relaxed">
          自訂字卡會儲存在此裝置的瀏覽器中，重新整理不會消失。
        </p>
      </div>

      <AddCardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addCard}
        onDeleteById={deleteCustomCard}
        customCards={customCards}
      />

      <ImportCardsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={importCards}
      />
    </div>
  );
}
