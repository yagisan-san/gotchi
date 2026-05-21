export type FoodCategory = '全部' | 'ご飯・麺' | 'おかず' | 'スナック' | 'ドリンク';

export interface FoodPreset {
  name: string;
  calories: number;
  emoji: string;
  category: Exclude<FoodCategory, '全部'>;
}

export const FOODS: FoodPreset[] = [
  // ご飯・麺
  { name: 'ご飯（1杯）',   calories: 252, emoji: '🍚', category: 'ご飯・麺' },
  { name: 'おにぎり',      calories: 180, emoji: '🍙', category: 'ご飯・麺' },
  { name: 'お茶漬け',      calories: 160, emoji: '🍵', category: 'ご飯・麺' },
  { name: '卵かけご飯',    calories: 320, emoji: '🥚', category: 'ご飯・麺' },
  { name: 'チャーハン',    calories: 680, emoji: '🍳', category: 'ご飯・麺' },
  { name: 'ラーメン',      calories: 670, emoji: '🍜', category: 'ご飯・麺' },
  { name: 'つけ麺',        calories: 750, emoji: '🍜', category: 'ご飯・麺' },
  { name: 'うどん',        calories: 380, emoji: '🍝', category: 'ご飯・麺' },
  { name: 'そば',          calories: 340, emoji: '🍜', category: 'ご飯・麺' },
  { name: 'パスタ',        calories: 620, emoji: '🍝', category: 'ご飯・麺' },
  { name: 'カレー',        calories: 720, emoji: '🍛', category: 'ご飯・麺' },
  { name: 'お弁当',        calories: 650, emoji: '🍱', category: 'ご飯・麺' },
  { name: '食パン（1枚）', calories: 150, emoji: '🍞', category: 'ご飯・麺' },
  { name: 'クロワッサン',  calories: 230, emoji: '🥐', category: 'ご飯・麺' },

  // おかず
  { name: 'サラダ',        calories:  80, emoji: '🥗', category: 'おかず' },
  { name: '唐揚げ（3個）', calories: 260, emoji: '🍗', category: 'おかず' },
  { name: '焼き魚',        calories: 180, emoji: '🐟', category: 'おかず' },
  { name: '焼き肉',        calories: 480, emoji: '🥩', category: 'おかず' },
  { name: '寿司（1貫）',   calories:  60, emoji: '🍣', category: 'おかず' },
  { name: '刺し身',        calories: 120, emoji: '🐠', category: 'おかず' },
  { name: 'ハンバーグ',    calories: 350, emoji: '🍔', category: 'おかず' },
  { name: '餃子（5個）',   calories: 280, emoji: '🥟', category: 'おかず' },
  { name: '天ぷら',        calories: 350, emoji: '🍤', category: 'おかず' },
  { name: '卵（1個）',     calories:  90, emoji: '🥚', category: 'おかず' },
  { name: '豆腐',          calories:  56, emoji: '🫙', category: 'おかず' },
  { name: 'ハンバーガー',  calories: 540, emoji: '🍔', category: 'おかず' },
  { name: 'ピザ（1切れ）', calories: 280, emoji: '🍕', category: 'おかず' },
  { name: 'たこ焼き（6個）', calories: 320, emoji: '🐙', category: 'おかず' },

  // スナック
  { name: 'バナナ',        calories:  86, emoji: '🍌', category: 'スナック' },
  { name: 'りんご',        calories:  84, emoji: '🍎', category: 'スナック' },
  { name: 'ヨーグルト',    calories: 120, emoji: '🥛', category: 'スナック' },
  { name: 'アイス',        calories: 180, emoji: '🍦', category: 'スナック' },
  { name: 'チョコ',        calories: 270, emoji: '🍫', category: 'スナック' },
  { name: 'ポテチ（1袋）', calories: 350, emoji: '🥔', category: 'スナック' },
  { name: 'クッキー（3枚）', calories: 180, emoji: '🍪', category: 'スナック' },
  { name: 'ケーキ（1切れ）', calories: 380, emoji: '🍰', category: 'スナック' },
  { name: 'おせんべい',    calories: 120, emoji: '🍘', category: 'スナック' },
  { name: 'プロテイン',    calories: 120, emoji: '💊', category: 'スナック' },

  // ドリンク
  { name: 'コーヒー',      calories:  10, emoji: '☕', category: 'ドリンク' },
  { name: 'カフェラテ',    calories: 130, emoji: '☕', category: 'ドリンク' },
  { name: 'コーラ（500ml）', calories: 225, emoji: '🥤', category: 'ドリンク' },
  { name: 'オレンジジュース', calories: 160, emoji: '🍊', category: 'ドリンク' },
  { name: 'ビール（350ml）', calories: 140, emoji: '🍺', category: 'ドリンク' },
  { name: 'ワイン（1杯）', calories: 120, emoji: '🍷', category: 'ドリンク' },
  { name: 'スポドリ',      calories:  80, emoji: '💧', category: 'ドリンク' },
  { name: '水',            calories:   0, emoji: '💧', category: 'ドリンク' },
];

export const FOOD_CATEGORIES: FoodCategory[] = ['ご飯・麺', 'おかず', 'スナック', 'ドリンク', '全部'];
export const MEAL_TYPES = ['朝', '昼', '夜', '間食'] as const;
export type MealType = typeof MEAL_TYPES[number];
