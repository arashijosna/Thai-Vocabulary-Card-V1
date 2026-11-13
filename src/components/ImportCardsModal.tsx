import { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { CardInput } from '../data/cards';

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (cards: CardInput[]) => void;
}

interface ParsedCard {
  thai: string;
  romanization: string;
  zhuyin: string;
  chinese: string;
  example: string;
  exampleChinese: string;
}

const SAMPLE = `[
  {
    "thai": "ขอโทษ",
    "pinyin": "kǒr-tôot",
    "chinese": "不好意思／對不起",
    "example": "ขอโทษครับ"
  }
]`;

export default function ImportCardsModal({ open, onClose, onImport }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<ParsedCard[] | null>(null);

  if (!open) return null;

  function handleParse() {
    setError('');
    setParsed(null);
    if (!text.trim()) {
      setError('請先貼上 JSON 資料');
      return;
    }
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      setError('JSON 格式不正確，請確認引號、逗號與括號是否完整');
      return;
    }
    if (!Array.isArray(data)) {
      setError('最外層必須是陣列，例如：[ { ... }, { ... } ]');
      return;
    }
    const cards: ParsedCard[] = [];
    let invalid = 0;
    for (const item of data) {
      if (typeof item !== 'object' || item === null) {
        invalid++;
        continue;
      }
      const obj = item as Record<string, unknown>;
      const thai = typeof obj.thai === 'string' ? obj.thai.trim() : '';
      const romanization =
        typeof obj.pinyin === 'string' ? obj.pinyin.trim() : '';
      const chinese = typeof obj.chinese === 'string' ? obj.chinese.trim() : '';
      const zhuyin = typeof obj.zhuyin === 'string' ? obj.zhuyin.trim() : '';
      if (!thai || !romanization || !chinese) {
        invalid++;
        continue;
      }
      cards.push({
        thai,
        romanization,
        zhuyin,
        chinese,
        example: typeof obj.example === 'string' ? obj.example.trim() : '',
        exampleChinese: '',
      });
    }
    if (cards.length === 0) {
      setError('沒有找到有效的字卡，請確認每筆資料都有 thai、pinyin、chinese 三個欄位');
      return;
    }
    setParsed(cards);
    if (invalid > 0) {
      setError(`有 ${invalid} 筆資料格式不正確已略過（缺少必填欄位）`);
    }
  }

  function handleConfirm() {
    if (!parsed || parsed.length === 0) return;
    onImport(parsed);
    setText('');
    setParsed(null);
    setError('');
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/40 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[#FAF5EC] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-amber-900/10 sticky top-0 bg-[#FAF5EC] z-10">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-orange-600" />
            批次匯入單字
          </h2>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-stone-600 leading-relaxed">
            貼上 JSON 格式的單字陣列，每筆資料包含
            <code className="mx-1 rounded bg-amber-900/10 px-1.5 py-0.5 text-xs font-mono">thai</code>
            <code className="mx-1 rounded bg-amber-900/10 px-1.5 py-0.5 text-xs font-mono">pinyin</code>
            <code className="mx-1 rounded bg-amber-900/10 px-1.5 py-0.5 text-xs font-mono">chinese</code>
            三個必填欄位，例句
            <code className="mx-1 rounded bg-amber-900/10 px-1.5 py-0.5 text-xs font-mono">example</code>
            為選填。
          </p>

          <textarea
            className="w-full h-48 rounded-xl border border-amber-900/15 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition font-mono leading-relaxed"
            placeholder={`貼上 JSON，例如：\n${SAMPLE}`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setParsed(null);
              setError('');
            }}
            spellCheck={false}
          />

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {parsed && parsed.length > 0 && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-sm font-bold text-green-700">
                  已解析出 {parsed.length} 張字卡
                </p>
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {parsed.map((c, i) => (
                  <li
                    key={i}
                    className="text-sm text-stone-700 truncate"
                    style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}
                  >
                    {c.thai} ・ {c.chinese}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleParse}
              className="flex-1 rounded-xl bg-white border border-amber-900/15 text-stone-700 font-bold py-3.5 transition hover:bg-orange-50 active:scale-95"
            >
              檢查資料
            </button>
            <button
              onClick={handleConfirm}
              disabled={!parsed || parsed.length === 0}
              className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 shadow-md shadow-orange-200 transition active:scale-95 disabled:bg-stone-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              確定匯入
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
