import { supabase } from './supabase';
import type { Flashcard } from '../data/cards';

export async function fetchCardsFromCloud(): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('讀取單字失敗:', error);
    return [];
  }
  return data || [];
}

export async function addCardToCloud(card: Flashcard): Promise<boolean> {
  const { error } = await supabase.from('flashcards').insert([card]);
  if (error) {
    console.error('新增單字失敗:', error);
    return false;
  }
  return true;
}

export async function addMultipleCardsToCloud(cards: Flashcard[]): Promise<boolean> {
  const { error } = await supabase.from('flashcards').insert(cards);
  if (error) {
    console.error('批次新增失敗:', error);
    return false;
  }
  return true;
}

export async function deleteCardFromCloud(id: string): Promise<boolean> {
  const { error } = await supabase.from('flashcards').delete().eq('id', id);
  if (error) {
    console.error('刪除單字失敗:', error);
    return false;
  }
  return true;
}

export function makeId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
