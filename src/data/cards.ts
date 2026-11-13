export interface Flashcard {
  id: string;
  thai: string;
  romanization: string;
  chinese: string;
  example: string;
  exampleChinese: string;
  zhuyin?: string;
  custom?: boolean;
}

export type CardInput = Omit<Flashcard, 'id' | 'custom'>;

export const DEFAULT_CARDS: Flashcard[] = [
  {
    id: 'd1',
    thai: 'สวัสดีค่ะ',
    romanization: 'sà-wàt-dii khâ',
    zhuyin: 'ㄙㄚˇ ㄨㄚˇ ㄉㄧ ㄎㄚˋ',
    chinese: '你好',
    example: 'สวัสดีค่ะ สบายดีไหมคะ',
    exampleChinese: '妳好，最近好嗎？'
  },
  {
    id: 'd2',
    thai: 'ขอบคุณค่ะ',
    romanization: 'khɔ̀ɔp-khun khâ',
    zhuyin: 'ㄎㄛˇ ㄎㄨㄣ ㄎㄚˋ',
    chinese: '謝謝',
    example: 'ขอบคุณค่ะ สำหรับความช่วยเหลือ',
    exampleChinese: '謝謝妳的幫忙。'
  },
  {
    id: 'd3',
    thai: 'ขอโทษค่ะ',
    romanization: 'khɔ̌ɔ-thôot khâ',
    zhuyin: 'ㄎㄡˇ ㄊㄡˋ ㄎㄚˋ',
    chinese: '對不起',
    example: 'ขอโทษค่ะ ฉันมาสาย',
    exampleChinese: '對不起，我遲到了。'
  },
  {
    id: 'd4',
    thai: 'ไม่เป็นไรค่ะ',
    romanization: 'mâi pen rai khâ',
    zhuyin: 'ㄇㄞˋ ㄅㄣ ㄖㄞ ㄎㄚˋ',
    chinese: '沒關係',
    example: 'ไม่เป็นไรค่ะ ฉันรอได้',
    exampleChinese: '沒關係，我可以等。'
  },
  {
    id: 'd5',
    thai: 'ใช่ค่ะ',
    romanization: 'châi khâ',
    zhuyin: 'ㄔㄞˋ ㄎㄚˋ',
    chinese: '是的',
    example: 'ใช่ค่ะ ฉันเป็นคนไต้หวัน',
    exampleChinese: '是的，我是台灣人。'
  },
  {
    id: 'd6',
    thai: 'ไม่ใช่ค่ะ',
    romanization: 'mâi châi khâ',
    zhuyin: 'ㄇㄞˋ ㄔㄞˋ ㄎㄚˋ',
    chinese: '不是',
    example: 'ไม่ใช่ค่ะ ฉันไม่ได้ทำ',
    exampleChinese: '不是，我沒有做。'
  },
  {
    id: 'd7',
    thai: 'เข้าใจไหมคะ',
    romanization: 'khâo-jai mǎi khá',
    zhuyin: 'ㄎㄠˋ ㄐㄞ ㄇㄞˊ ㄎㄚˊ',
    chinese: '懂嗎？',
    example: 'อธิบายแบบนี้ เข้าใจไหมคะ',
    exampleChinese: '這樣解釋懂嗎？'
  },
  {
    id: 'd8',
    thai: 'เข้าใจค่ะ',
    romanization: 'khâo-jai khâ',
    zhuyin: 'ㄎㄠˋ ㄐㄞ ㄎㄚˋ',
    chinese: '懂了',
    example: 'เข้าใจค่ะ ขอบคุณที่อธิบาย',
    exampleChinese: '懂了，謝謝你的解釋。'
  },
  {
    id: 'd9',
    thai: 'เท่าไหร่คะ',
    romanization: 'thâo-rài khá',
    zhuyin: 'ㄊㄠˋ ㄖㄞˇ ㄎㄚˊ',
    chinese: '多少錢？',
    example: 'อันนี้ราคาเท่าไหร่คะ',
    exampleChinese: '這個多少錢？'
  },
  {
    id: 'd10',
    thai: 'ลาก่อนค่ะ',
    romanization: 'laa-gɔ̀ɔn khâ',
    zhuyin: 'ㄌㄚ ㄍㄨㄥˇ ㄎㄚˋ',
    chinese: '再見',
    example: 'ลาก่อนค่ะ ไว้เจอกันใหม่',
    exampleChinese: '再見，下次見。'
  }
];
