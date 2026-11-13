import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  Turtle,
  Gauge,
  Trash2,
  Search,
  X,
} from 'lucide-react';
import FlashCard from './components/FlashCard';
import PracticeSection from './components/PracticeSection';
import AddCardModal from './components/AddCardModal';
import ImportCardsModal from './components/ImportCardsModal';
import { DEFAULT_CARDS, type Flashcard, type CardInput } from './data/cards';
import {
  fetchCardsFromCloud,
  addCardToCloud,
  addMultipleCardsToCloud,
  deleteCardFromCloud,
  makeId,
} from './lib/storage';
import { stopSpeaking } from './lib/speech';

export default function App() {
  const [customCards, setCustomCards] = useState<Flashcard[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 初次載入雲端資料 & 嘗試鎖定直式螢幕
  useEffect(() => {
    async function loadCloudData() {
      setIsSyncing(true);
      const cloudCards = await fetchCardsFromCloud();
      setCustomCards(cloudCards);
      setIsSyncing(false);
    }
    loadCloudData();

    // 針對支援 Screen Orientation API 的裝置鎖定直式
    if (screen.orientation && 'lock' in screen.orientation) {
      (screen.orientation as unknown as { lock: (o: string) => Promise<void> })
        .lock('portrait')
        .catch(() => {});
    }
  }, []);

  const allCards = useMemo(() => [...DEFAULT_CARDS, ...customCards], [customCards]);

  // 根據搜尋關鍵字過濾字卡（支援中文、泰文、拼音、注音）
  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCards;
    return allCards.filter(
      (c) =>
        c.chinese.toLowerCase().includes(q) ||
        c.thai.toLowerCase().includes(q) ||
        c.romanization.toLowerCase().includes(q) ||
        (c.zhuyin && c.zhuyin.toLowerCase().includes(q)) ||
        (c.exampleChinese && c.exampleChinese.toLowerCase().includes(q))
    );
  }, [allCards, searchQuery]);

  const safeIndex = Math.min(index, Math.max(0, filteredCards.length - 1));
  const card = filteredCards[safeIndex];

  useEffect(() => {
    stopSpeaking();
  }, [safeIndex, searchQuery]);

  // 當搜尋關鍵字改變時，自動回到第一張符合的字卡
  useEffect(() => {
    setIndex(0);
  }, [searchQuery]);

  function goTo(newIndex: number) {
    setIndex(Math.max(0, Math.min(filteredCards.length - 1, newIndex)));
  }

  async function addCard(data: CardInput) {
    const newCard: Flashcard = { id: makeId(), custom: true, ...data };
    const success = await addCardToCloud(newCard);
    if (success) {
      const next = [...customCards, newCard];
      setCustomCards(next);
      setSearchQuery(''); // 清空搜尋以直接顯示新增的字卡
      setIndex(allCards.length);
    } else {
      alert('雲端同步失敗，請稍後再試');
    }
  }

  async function importCards(data: CardInput[]) {
    const newCards: Flashcard[] = data.map((d) => ({
      id: makeId(),
      custom: true,
      ...d,
    }));
    const success = await addMultipleCardsToCloud(newCards);
    if (success) {
      const next = [...customCards, ...newCards];
      setCustomCards(next);
      setSearchQuery('');
      setIndex(allCards.length);
    } else {
      alert('雲端批次匯入失敗，請稍後再試');
    }
  }

  async function deleteCustomCard(id: string) {
    const success = await deleteCardFromCloud(id);
    if (success) {
      const removedIndex = filteredCards.findIndex((c) => c.id === id);
      const next = customCards.filter((c) => c.id !== id);
      setCustomCards(next);
      if (removedIndex !== -1 && removedIndex <= safeIndex) {
        setIndex((i) => Math.max(0, i - 1));
      }
    } else {
      alert('刪除失敗，請檢查網路連線');
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-stone-800">
      {/* 手機轉橫向時的防呆遮罩 */}
      <div
        id="landscape-blocker"
        className="fixed inset-0 z-[999] bg-[#FAF5EC] flex-col items-center justify-center p-6 text-center"
      >
        <p className="text-lg font-bold text-stone-800 mb-1">請將手機轉回直向 📱</p>
        <p className="text-sm text-stone-500">本應用程式鎖定直式畫面以提供最佳學習體驗</p>
      </div>

      {/* 加入 safe-area-container 避開頂部時間與瀏海 */}
      <div className="mx-auto max-w-md px-4 safe-area-container">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              泰語單字卡
              {isSyncing && (
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-normal">
                  雲端同步中
                </span>
              )}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">學習與記憶卡</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportOpen(true)}
              aria-label="匯入"
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
              新增
            </button>
          </div>
        </header>

        {/* 搜尋列 */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="輸入中文意思、泰文或拼音搜尋..."
            className="w-full rounded-2xl bg-white border border-amber-900/10 pl-10 pr-9 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="清除搜尋"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 進度條與卡片計數 */}
        <div className="mb-2">
          <div className="h-2 rounded-full bg-amber-900/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-300"
              style={{
                width: `${
                  filteredCards.length > 0
                    ? ((safeIndex + 1) / filteredCards.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-stone-500">
            <span>
              {filteredCards.length > 0
                ? `${safeIndex + 1} / ${filteredCards.length}`
                : '0 / 0'}
              {searchQuery && ` (篩選自 ${allCards.length} 張)`}
            </span>
            {card?.custom && (
              <button
                onClick={() => deleteCustomCard(card.id)}
                className="flex items-center gap-1 text-red-400 hover:text-red-600 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                刪除字卡
              </button>
            )}
          </div>
        </div>

        {/* 字卡顯示區 */}
        {card ? (
          <FlashCard card={card} rate={rate} />
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center text-stone-500 shadow-sm border border-amber-900/10">
            {searchQuery ? (
              <div>
                <p className="font-semibold text-stone-700 mb-1">
                  找不到符合「{searchQuery}」的字卡
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-orange-600 font-bold underline"
                >
                  清除搜尋條件
                </button>
              </div>
            ) : (
              '目前沒有單字卡'
            )}
          </div>
        )}

        {/* 上一張 / 下一張按鈕 */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={() => goTo(safeIndex - 1)}
            disabled={safeIndex === 0 || filteredCards.length === 0}
            aria-label="上一個"
            className="flex items-center gap-1.5 rounded-full bg-white border border-amber-900/10 px-5 py-3 font-semibold text-stone-700 shadow-sm transition hover:bg-orange-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            上一張
          </button>
          <button
            onClick={() => goTo(safeIndex + 1)}
            disabled={safeIndex >= filteredCards.length - 1 || filteredCards.length === 0}
            aria-label="下一個"
            className="flex items-center gap-1.5 rounded-full bg-orange-500 px-6 py-3 font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下一張
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 語速切換 */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-xs text-stone-500 mr-1">語速</span>
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
              1.0x
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
              0.7x
            </button>
          </div>
        </div>

        {/* 發音練習區 */}
        {card && <PracticeSection card={card} />}
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
