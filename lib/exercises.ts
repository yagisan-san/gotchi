export interface Exercise {
  name: string;
  emoji: string;
  metPerHour: number; // kcal per kg per hour (MET value)
}

export const EXERCISES: Exercise[] = [
  { name: 'ウォーキング',  emoji: '🚶',  metPerHour: 3.5  },
  { name: 'ジョギング',    emoji: '🏃',  metPerHour: 7.0  },
  { name: 'ランニング',    emoji: '🏃',  metPerHour: 10.0 },
  { name: '筋トレ',       emoji: '💪',  metPerHour: 5.0  },
  { name: '水泳',         emoji: '🏊',  metPerHour: 8.0  },
  { name: 'サイクリング',  emoji: '🚴',  metPerHour: 6.0  },
  { name: 'サッカー',     emoji: '⚽',  metPerHour: 7.0  },
  { name: '野球',         emoji: '⚾',  metPerHour: 4.0  },
  { name: 'バスケ',       emoji: '🏀',  metPerHour: 8.0  },
  { name: 'テニス',       emoji: '🎾',  metPerHour: 6.0  },
  { name: 'バドミントン',  emoji: '🏸',  metPerHour: 5.5  },
  { name: 'バレー',       emoji: '🏐',  metPerHour: 6.0  },
  { name: 'ヨガ',         emoji: '🧘',  metPerHour: 3.0  },
  { name: '縄跳び',       emoji: '🤸',  metPerHour: 9.0  },
  { name: 'ダンス',       emoji: '💃',  metPerHour: 5.0  },
  { name: 'ゴルフ',       emoji: '⛳',  metPerHour: 4.5  },
  { name: 'スキー',       emoji: '⛷️', metPerHour: 7.0  },
  { name: '階段昇降',     emoji: '🪜',  metPerHour: 8.0  },
  { name: '家事',         emoji: '🧹',  metPerHour: 2.5  },
  { name: 'ストレッチ',   emoji: '🤸',  metPerHour: 2.5  },
];

export const DURATION_OPTIONS = [10, 20, 30, 45, 60, 90];

export function calcExerciseCalories(weightKg: number, metPerHour: number, minutes: number): number {
  const w = weightKg > 0 ? weightKg : 65;
  return Math.round(w * metPerHour * (minutes / 60));
}
