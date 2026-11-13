import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { makeId } from '../lib/storage';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (card: {
    thai: string;
    romanization: string;
    zhuyin: string;
    chinese: string;
    example: string;
    exampleChinese: string;
  }) => void;
  onDeleteById: (id: string) => void;
  customCards: Array<{ id: string; thai: string; romanization: string; chinese: string }>;
}

const EMPTY = {
  thai: '',
  romanization: '',
  zhuyin: '',
  chinese: '',
  example: '',
  exampleChinese: '',
};

export default function AddCardModal({ open, onClose, onAdd, onDeleteById, customCards }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.thai.trim() || !form.romanization.trim() || !form.chinese.trim()) {
      setError('請填寫泰文、羅馬拼音與中文意思');
      return;
    }
    onAdd({
      thai: form.thai.trim(),
      romanization: form.romanization.trim(),
      zhuyin: form.zhuyin.trim(),
      chinese: form.chinese.trim(),
      example: form.example.trim(),
      exampleChinese: form.exampleChinese.trim(),
    });
    setForm(EMPTY);
    setError('');
    onClose();
  }

  const inputClass =
    'w-full rounded-xl border border-amber-900/15 bg-white px-4 py-3 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition';

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
            <Plus className="w-5 h-5 text-orange-600" />
            新增單字卡
          </h2>
          <button
            onClick={onClose}
            aria-label="關閉"
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              泰文 <span className="text-orange-600">*</span>
            </label>
            <input
              className={inputClass}
              style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}
              placeholder="例如：สวัสดี"
              value={form.thai}
              onChange={(e) => setForm({ ...form, thai: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              羅馬拼音 <span className="text-orange-600">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="例如：sà-wàt-dii"
              value={form.romanization}
              onChange={(e) => setForm({ ...form, romanization: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              注音發音參考（選填）
            </label>
            <input
              className={inputClass}
              placeholder="例如：ㄙㄚ-ㄨㄚ-ㄉㄧ"
              value={form.zhuyin}
              onChange={(e) => setForm({ ...form, zhuyin: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              繁體中文意思 <span className="text-orange-600">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="例如：你好"
              value={form.chinese}
              onChange={(e) => setForm({ ...form, chinese: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              使用情境例句（選填）
            </label>
            <input
              className={inputClass}
              style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}
              placeholder="泰文例句"
              value={form.example}
              onChange={(e) => setForm({ ...form, example: e.target.value })}
            />
            <input
              className={inputClass + ' mt-2'}
              placeholder="例句的中文翻譯"
              value={form.exampleChinese}
              onChange={(e) => setForm({ ...form, exampleChinese: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 shadow-md shadow-orange-200 transition active:scale-95"
          >
            儲存字卡
          </button>
        </form>

        {customCards.length > 0 && (
          <div className="px-5 pb-6">
            <p className="text-sm font-semibold text-stone-700 mb-2">
              我新增的字卡（{customCards.length}）
            </p>
            <ul className="space-y-2">
              {customCards.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl bg-white border border-amber-900/10 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p
                      className="font-semibold text-stone-800 truncate"
                      style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}
                    >
                      {c.thai}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {c.romanization} ・ {c.chinese}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteById(c.id)}
                    aria-label="刪除字卡"
                    className="ml-3 shrink-0 rounded-full p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
