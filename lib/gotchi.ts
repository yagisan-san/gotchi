export type Stage = 0 | 1 | 2 | 3 | 4 | 5;
export type Mood = 'happy' | 'sleepy' | 'hungry' | 'playful' | 'focused';

export const STATE_VERSION = 4;

export interface LogEntry {
  date: string;
  weight: number;
  steps: number;
  calories: number;
  bmi: number;
  stage: Stage;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  emoji: string;
  minutes: number;
  calories: number;
}

export interface MealEntry {
  id: string;
  foodName: string;
  calories: number;
  emoji: string;
  mealType: string;
}

export interface GotchiState {
  version: number;
  weight: string;
  targetWeight: string;
  height: string;
  steps: string;
  log: LogEntry[];
  streak: number;
  lastRecordDate: string;
  characterId: string | null;
  petCountToday: number;
  lastPetDate: string;
  totalPets: number;
  todayMissionId: string;
  todayMissionDate: string;
  missionsCompleted: number;
  todayMeals: MealEntry[];
  lastMealDate: string;
  todayExercises: ExerciseEntry[];
  lastExerciseDate: string;
}

export const INITIAL_STATE: GotchiState = {
  version: STATE_VERSION,
  weight: '',
  targetWeight: '',
  height: '',
  steps: '',
  log: [],
  streak: 0,
  lastRecordDate: '',
  characterId: null,
  petCountToday: 0,
  lastPetDate: '',
  totalPets: 0,
  todayMissionId: '',
  todayMissionDate: '',
  missionsCompleted: 0,
  todayMeals: [],
  lastMealDate: '',
  todayExercises: [],
  lastExerciseDate: '',
};

export function todayStr(): string {
  return new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function calcDaysSince(dateStr: string): number {
  if (!dateStr) return 999;
  const last = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStage(weight: number, targetWeight: number, daysSinceRecord: number): Stage {
  if (daysSinceRecord >= 5) return 5;
  if (daysSinceRecord >= 3) return 4;
  if (!weight || !targetWeight) return 0;
  const diff = weight - targetWeight;
  if (diff <= 0) return 1;
  if (diff <= 5) return 2;
  return 3;
}

export function calcBMI(weight: number, heightCm: number): number {
  if (!weight || !heightCm) return 0;
  const h = heightCm / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

export function calcCalories(steps: number): number {
  return Math.round(steps * 0.04);
}

export interface StageInfo {
  label: string;
  color: string;
  glowClass: string;
}

export function getStageInfo(stage: Stage): StageInfo {
  const info: StageInfo[] = [
    { label: '🥚 たまご',       color: '#f4c87a', glowClass: 'glow-static'  },
    { label: '✨ スリム',        color: '#98d8c8', glowClass: 'glow-gold'    },
    { label: '😅 ちょっと太め', color: '#f5a623', glowClass: 'glow-static'  },
    { label: '😨 デブ期',       color: '#e8935a', glowClass: 'glow-static'  },
    { label: '💤 サボり中',     color: '#888888', glowClass: ''              },
    { label: '💀 ゴースト',     color: '#ff6b6b', glowClass: 'glow-red'     },
  ];
  return info[stage];
}

// ── Daily mood ──────────────────────────────────────────────────────────────

export interface MoodInfo {
  emoji: string;
  label: string;
  animClass: string;
  serifs: string[];
}

export function getDailyMood(dateStr: string): Mood {
  const hash = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const moods: Mood[] = ['happy', 'sleepy', 'hungry', 'playful', 'focused'];
  return moods[hash % moods.length];
}

export function getMoodInfo(mood: Mood): MoodInfo {
  const map: Record<Mood, MoodInfo> = {
    happy:   { emoji: '✨', label: '上機嫌',       animClass: 'animate-idle-bounce',  serifs: ['今日もいい日だ！', 'ウキウキしてる！', 'テンション高め！', 'なんか嬉しい！'] },
    sleepy:  { emoji: '💤', label: 'ねむい',       animClass: 'animate-idle-sway',    serifs: ['zzz...', 'もう少し寝かせて...', 'だるい...', 'あくびが止まらない'] },
    hungry:  { emoji: '🍖', label: 'おなかすいた', animClass: 'animate-idle-wobble',  serifs: ['おなかすいた...', 'なんか食べたい', 'ぐぅ〜', '記録したら落ち着く'] },
    playful: { emoji: '🎮', label: '遊びたい',     animClass: 'animate-idle-bounce',  serifs: ['遊んで！', 'なでてなでて！', 'かまってほしい！', 'ひまだー！'] },
    focused: { emoji: '💪', label: '集中モード',   animClass: 'animate-idle-float',   serifs: ['今日も頑張ろう！', '気合い入ってる！', 'やれる気がする！', '集中してる！'] },
  };
  return map[mood];
}

export function pickSerif(serifs: string[], dateStr: string): string {
  const h = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return serifs[h % serifs.length];
}

// ── Missions ─────────────────────────────────────────────────────────────────

export interface Mission {
  id: string;
  text: string;
  emoji: string;
}

const MISSION_POOL: Mission[] = [
  { id: 'record_today',  text: '今日の体重を記録しよう',      emoji: '📝' },
  { id: 'steps_5000',   text: '今日は5000歩以上歩こう',      emoji: '🚶' },
  { id: 'steps_8000',   text: '今日は8000歩以上歩こう',      emoji: '🏃' },
  { id: 'steps_10000',  text: '1万歩チャレンジ！',           emoji: '⚡' },
  { id: 'pet_5',        text: 'キャラを5回なでよう',          emoji: '🖐' },
  { id: 'bmi_check',    text: '身長を入力してBMIを確認しよう', emoji: '📏' },
  { id: 'streak_keep',  text: '連続記録を続けよう',           emoji: '🔥' },
  { id: 'goal_set',     text: '目標体重を確認しよう',         emoji: '🎯' },
];

export function getMissionForDate(dateStr: string): Mission {
  const hash = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return MISSION_POOL[hash % MISSION_POOL.length];
}

export function isMissionComplete(mission: Mission, state: GotchiState): boolean {
  const today = todayStr();
  switch (mission.id) {
    case 'record_today':  return state.lastRecordDate === today;
    case 'steps_5000':   return Number(state.steps) >= 5000;
    case 'steps_8000':   return Number(state.steps) >= 8000;
    case 'steps_10000':  return Number(state.steps) >= 10000;
    case 'pet_5':        return state.petCountToday >= 5;
    case 'bmi_check':    return !!(state.height && state.weight);
    case 'streak_keep':  return state.streak >= 1 && state.lastRecordDate === today;
    case 'goal_set':     return !!state.targetWeight;
    default:             return false;
  }
}

// ── Collection ───────────────────────────────────────────────────────────────

export interface CollectionItem {
  id: string;
  name: string;
  emoji: string;
  hint: string;
}

export const COLLECTION: CollectionItem[] = [
  { id: 'streak3',   name: '3日連続',     emoji: '🥉', hint: '3日連続で記録する' },
  { id: 'streak7',   name: '1週間',       emoji: '🥈', hint: '7日連続で記録する' },
  { id: 'streak30',  name: '30日連続',    emoji: '🥇', hint: '30日連続で記録する' },
  { id: 'goal',      name: '目標達成！',   emoji: '🏆', hint: '目標体重を達成する' },
  { id: 'pet50',     name: 'なで師',      emoji: '❤️', hint: '合計50回なでる' },
  { id: 'mission10', name: 'ミッション10', emoji: '⭐', hint: 'ミッションを10回クリア' },
];

export function getUnlockedIds(state: GotchiState): string[] {
  const ids: string[] = [];
  if (state.streak >= 3)  ids.push('streak3');
  if (state.streak >= 7)  ids.push('streak7');
  if (state.streak >= 30) ids.push('streak30');
  if (state.totalPets >= 50) ids.push('pet50');
  if (state.missionsCompleted >= 10) ids.push('mission10');
  const w = Number(state.weight), tw = Number(state.targetWeight);
  if (w > 0 && tw > 0 && w <= tw) ids.push('goal');
  return ids;
}
