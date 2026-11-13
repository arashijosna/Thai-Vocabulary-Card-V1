export interface Flashcard {
  id: string;
  thai: string;
  romanization: string;
  chinese: string;
  example: string;
  exampleChinese: string;
  /** 以注音符號拼出的近似發音參考 */
  zhuyin?: string;
  custom?: boolean;
}

export type CardInput = Omit<Flashcard, 'id' | 'custom'>;

export const DEFAULT_CARDS: Flashcard[] = [
  {
    id: 'd1',
    thai: 'สวัสดีครับ/ค่ะ',
    romanization: 'sà-wàt-dii kráp/kâ',
    zhuyin: 'ㄙㄚ-ㄨㄚ-ㄉㄧ ㄎㄌㄚˊㄅ／ㄎㄚˇ',
    chinese: '你好（男/女用）',
    example: 'สวัสดีครับ ยินดีที่ได้รู้จัก',
    exampleChinese: '你好，很高興認識你。',
  },
  {
    id: 'd2',
    thai: 'ขอบคุณ',
    romanization: 'kòp-kun',
    zhuyin: 'ㄎㄛˇㄆ-ㄍㄨㄣ',
    chinese: '謝謝',
    example: 'ขอบคุณมากครับ',
    exampleChinese: '非常謝謝你。',
  },
  {
    id: 'd3',
    thai: 'เท่าไหร่',
    romanization: 'tâo-rài',
    zhuyin: 'ㄊㄠˊ-ㄌㄞˋ',
    chinese: '多少錢',
    example: 'อันนี้ราคาเท่าไหร่คะ',
    exampleChinese: '這個多少錢？（女生用）',
  },
  {
    id: 'd4',
    thai: 'ไม่เอาผัก',
    romanization: 'mâi ao phàk',
    zhuyin: 'ㄇㄞˋ-ㄠ-ㄆㄚˇㄍ',
    chinese: '不要加菜（類似不要辣的用法）',
    example: 'ขอไม่เอาผักนะครับ',
    exampleChinese: '請不要加菜，謝謝。',
  },
  {
    id: 'd5',
    thai: 'ไม่เผ็ด',
    romanization: 'mâi phèt',
    zhuyin: 'ㄇㄞˋ-ㄆㄜˋ',
    chinese: '不要辣',
    example: 'ขอไม่เผ็ดนะคะ',
    exampleChinese: '請不要辣。（女生用）',
  },
  {
    id: 'd6',
    thai: 'ไปที่ไหน',
    romanization: 'pai tîi nǎi',
    zhuyin: 'ㄆㄞ-ㄊㄧˊ-ㄋㄞˇ',
    chinese: '去哪裡',
    example: 'คุณจะไปที่ไหนครับ',
    exampleChinese: '你要去哪裡？（男生用）',
  },
  {
    id: 'd7',
    thai: 'ลดราคาหน่อยได้ไหม',
    romanization: 'lót raa-khaa nòi dâi mǎi',
    zhuyin: 'ㄌㄛˊ-ㄌㄚ-ㄍㄚ-ㄋㄞˇ-ㄌㄛㄧ-ㄉㄞˊ-ㄇㄞˇ',
    chinese: '可以便宜一點嗎',
    example: 'ลดราคาหน่อยได้ไหมคะ',
    exampleChinese: '可以便宜一點嗎？（女生用）',
  },
  {
    id: 'd8',
    thai: 'ห้องน้ำอยู่ที่ไหน',
    romanization: 'hôong náam yòo tîi nǎi',
    zhuyin: 'ㄏㄤˇ-ㄋㄚˊㄇ-ㄧㄡˋ-ㄊㄧˊ-ㄋㄞˇ',
    chinese: '廁所在哪裡',
    example: 'ขอโทษ ห้องน้ำอยู่ที่ไหนครับ',
    exampleChinese: '不好意思，請問廁所在哪裡？（男生用）',
  },
  {
    id: 'd9',
    thai: 'อร่อยมาก',
    romanization: 'a-ròi mâak',
    zhuyin: 'ㄚ-ㄌㄜㄨㄞˋ-ㄇㄚˊㄍ',
    chinese: '很好吃',
    example: 'อาหารอร่อยมากครับ',
    exampleChinese: '這道菜很好吃。（男生用）',
  },
  {
    id: 'd10',
    thai: 'ลาก่อน',
    romanization: 'laa-gòon',
    zhuyin: 'ㄌㄚ-ㄍㄜㄣˊ',
    chinese: '再見',
    example: 'ลาก่อน แล้วเจอกันใหม่',
    exampleChinese: '再見，下次見。',
  },
];
