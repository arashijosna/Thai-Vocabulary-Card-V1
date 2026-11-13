import type { Flashcard } from '../data/cards';

const STORAGE_KEY = 'thai-flashcards-custom-v1';

export function loadCustomCards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c: Flashcard) =>
        c && typeof c.thai === 'string' && typeof c.romanization === 'string' && typeof c.chinese === 'string'
    );
  } catch {
    return [];
  }
}

export function saveCustomCards(cards: Flashcard[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // 空間不足或瀏覽器限制時靜默失敗
  }
}

export function makeId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
