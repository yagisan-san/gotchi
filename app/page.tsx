"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PixelCanvas from "@/components/PixelCanvas";
import CharacterSelect from "@/components/CharacterSelect";
import { getCharPixels, CHARACTERS } from "@/lib/characters";
import { FOODS, FOOD_CATEGORIES, MEAL_TYPES, type FoodCategory, type MealType } from "@/lib/foods";
import { EXERCISES, DURATION_OPTIONS, calcExerciseCalories } from "@/lib/exercises";
import {
  Stage, GotchiState, LogEntry, MealEntry, ExerciseEntry,
  getStage, getStageInfo, calcBMI, calcCalories, calcDaysSince,
  getDailyMood, getMoodInfo, pickSerif,
  getMissionForDate, isMissionComplete,
  COLLECTION, getUnlockedIds,
  INITIAL_STATE, STATE_VERSION, todayStr,
} from "@/lib/gotchi";

const STORAGE_KEY = "gotchi_v2";
const MAX_PETS = 5;
type Tab = "char" | "record" | "food" | "exercise" | "mypage";
type MypageView = "main" | "charChange";
type RecordSubView = "main" | "history";
type HistoryTab = "graph" | "calendar";
interface FloatingItem { id: number; emoji: string }

export default function Page() {
  const [state, setState] = useState<GotchiState | null>(null);
  const [tab, setTab] = useState<Tab>("char");
  const [mypageView, setMypageView] = useState<MypageView>("main");
  const [reacting, setReacting] = useState(false);
  const [eating, setEating] = useState(false);
  const [hearts, setHearts] = useState<FloatingItem[]>([]);
  const [flyFoods, setFlyFoods] = useState<FloatingItem[]>([]);
  const [floatId, setFloatId] = useState(0);
  const [saved, setSaved] = useState(false);
  const [mealType, setMealType] = useState<MealType>("昼");
  const [foodCat, setFoodCat] = useState<FoodCategory>("ご飯・麺");
  const [selectedExercise, setSelectedExercise] = useState<typeof EXERCISES[0] | null>(null);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [mealFeedback, setMealFeedback] = useState<string | null>(null);
  const [recordSubView, setRecordSubView] = useState<RecordSubView>("main");
  const [historyTab, setHistoryTab] = useState<HistoryTab>("graph");
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [graphPeriod, setGraphPeriod] = useState<"all" | "month" | "week">("all");
  const [graphMonthOffset, setGraphMonthOffset] = useState(0);
  const [graphWeekOffset, setGraphWeekOffset] = useState(0);
  const [logShowCount, setLogShowCount] = useState(50);
  const prevUnlockedRef = useRef<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as GotchiState;
        if (parsed.version === STATE_VERSION) { setState(parsed); return; }
      } catch {}
    }
    setState(INITIAL_STATE);
  }, []);

  useEffect(() => {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const today = todayStr();
    const u: Partial<GotchiState> = {};
    if (state.lastPetDate !== today && state.petCountToday > 0) { u.petCountToday = 0; u.lastPetDate = today; }
    if (state.lastMealDate && state.lastMealDate !== today) { u.todayMeals = []; u.lastMealDate = today; }
    if (state.lastExerciseDate && state.lastExerciseDate !== today) { u.todayExercises = []; u.lastExerciseDate = today; }
    if (Object.keys(u).length) setState(s => s ? { ...s, ...u } : s);
  }, [state]);

  const handleSelectCharacter = useCallback((id: string) => {
    setState(s => s ? { ...s, characterId: id } : s);
    setMypageView("main");
  }, []);

  if (!state) return null;
  if (!state.characterId) return <CharacterSelect onSelect={handleSelectCharacter} />;

  // キャラ変更サブ画面
  if (mypageView === "charChange") {
    const unlockedColIds = getUnlockedIds(state);
    const unlockedCharIds = new Set(
      CHARACTERS.filter(c => !c.unlockId || unlockedColIds.includes(c.unlockId)).map(c => c.id)
    );
    // 解放済みを先に、未解放を後ろに並べる
    const sorted = [
      ...CHARACTERS.filter(c => unlockedCharIds.has(c.id)),
      ...CHARACTERS.filter(c => !unlockedCharIds.has(c.id)),
    ];
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <div style={{ maxWidth: "390px", margin: "0 auto", padding: "18px 20px 10px", display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setMypageView("main")}
            style={{ color: "var(--gold)", background: "transparent", border: "1px solid var(--border)", fontFamily: "inherit", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", flexShrink: 0 }}>
            ← 戻る
          </button>
          <h2 style={{ color: "var(--gold)", fontSize: "16px", fontWeight: "bold", letterSpacing: "0.1em" }}>キャラクター変更</h2>
          <span style={{ color: "var(--text-dim)", fontSize: "11px", marginLeft: "auto" }}>
            {unlockedCharIds.size}/{CHARACTERS.length}体解放
          </span>
        </div>
        <div style={{ maxWidth: "390px", margin: "0 auto", padding: "6px 20px 28px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {sorted.map(char => {
            const unlocked = unlockedCharIds.has(char.id);
            const isCurrent = state.characterId === char.id;
            // 解放条件テキスト
            const collectionItem = unlocked ? null : COLLECTION.find(c => c.id === char.unlockId);
            return (
              <button key={char.id}
                onClick={() => {
                  if (!unlocked) return;
                  setState(s => s ? { ...s, characterId: char.id } : s);
                  setMypageView("main");
                }}
                style={{
                  background: unlocked ? "var(--surface)" : "var(--bg)",
                  border: `2px solid ${isCurrent ? "var(--gold)" : unlocked ? "var(--border)" : "#1e1e1e"}`,
                  fontFamily: "inherit", borderRadius: "14px", padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: "14px",
                  textAlign: "left", cursor: unlocked ? "pointer" : "default", width: "100%",
                  opacity: unlocked ? 1 : 0.7,
                }}>
                {/* ピクセルアート：未解放はシルエット */}
                <div style={{ flexShrink: 0, filter: unlocked ? "none" : "brightness(0)", ...(isCurrent ? {} : {}) }}
                  className={isCurrent ? "glow-static" : ""}>
                  <PixelCanvas pixels={getCharPixels(char.id, 1)} scale={3} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {unlocked ? (
                    <>
                      <p style={{ color: isCurrent ? "var(--gold)" : "var(--text)", fontSize: "15px", fontWeight: "bold", marginBottom: "3px" }}>
                        {char.emoji} {char.name}
                      </p>
                      <p style={{ color: "var(--text-dim)", fontSize: "11px", lineHeight: 1.4 }}>{char.description}</p>
                      {isCurrent && <p style={{ color: "var(--gold)", fontSize: "11px", marginTop: "4px" }}>✓ 選択中</p>}
                    </>
                  ) : (
                    <>
                      <p style={{ color: "#444", fontSize: "15px", fontWeight: "bold", marginBottom: "3px" }}>？？？？</p>
                      <p style={{ color: "#444", fontSize: "11px", lineHeight: 1.4 }}>
                        🔒 {collectionItem?.hint ?? "???"}
                      </p>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const today = todayStr();
  const daysSince = calcDaysSince(state.lastRecordDate);
  const w = Number(state.weight), tw = Number(state.targetWeight), h = Number(state.height), st = Number(state.steps);
  const stage = getStage(w, tw, daysSince);
  const stageInfo = getStageInfo(stage);
  const mood = getDailyMood(today);
  const moodInfo = getMoodInfo(mood);
  const serif = pickSerif(moodInfo.serifs, today);
  const bmi = calcBMI(w, h);
  const stepsCalories = calcCalories(st);
  const exerciseCalories = (state.todayExercises || []).reduce((s, e) => s + e.calories, 0);
  const totalBurned = stepsCalories + exerciseCalories;
  const caloriesIn = (state.todayMeals || []).reduce((s, m) => s + m.calories, 0);
  const diff = w && tw ? w - tw : null;
  const mission = getMissionForDate(today);
  const missionDone = isMissionComplete(mission, state);
  const unlockedIds = getUnlockedIds(state);
  const charDef = CHARACTERS.find(c => c.id === state.characterId);
  const pixels = getCharPixels(state.characterId!, stage);
  const filteredFoods = foodCat === "全部" ? FOODS : FOODS.filter(f => f.category === foodCat);

  function addFloat(set: React.Dispatch<React.SetStateAction<FloatingItem[]>>, emoji: string, id: number) {
    set(prev => [...prev, { id, emoji }]);
    setTimeout(() => set(prev => prev.filter(x => x.id !== id)), 900);
  }
  function triggerReact() { setReacting(true); setTimeout(() => setReacting(false), 500); }

  function handleRecord() {
    if (!state || !state.weight || !state.targetWeight) return;
    const isNewDay = state.lastRecordDate !== today;
    const newStreak = isNewDay ? (daysSince <= 1 ? state.streak + 1 : 1) : state.streak;
    const entry: LogEntry = { date: today, weight: w, steps: st || 0, calories: totalBurned, bmi, stage };
    const wasComplete = isMissionComplete(mission, state);
    const ns = { ...state, log: [entry, ...state.log.filter(l => l.date !== today)], streak: newStreak, lastRecordDate: today };
    ns.missionsCompleted = state.missionsCompleted + (!wasComplete && isMissionComplete(mission, ns) ? 1 : 0);
    setState(ns); checkBadges(ns);
    setSaved(true); setTimeout(() => setSaved(false), 1500);
    triggerReact();
  }

  function handlePet() {
    if (!state || state.petCountToday >= MAX_PETS) return;
    const id = floatId + 1; setFloatId(id);
    addFloat(setHearts, "❤️", id);
    setState(s => s ? { ...s, petCountToday: s.petCountToday + 1, lastPetDate: today, totalPets: s.totalPets + 1 } : s);
    triggerReact();
  }

  function handleAddMeal(food: typeof FOODS[0]) {
    const id = floatId + 1; setFloatId(id);
    addFloat(setFlyFoods, food.emoji, id);
    setEating(true); setTimeout(() => setEating(false), 600);
    setMealFeedback(`${food.emoji} +${food.calories}kcal`);
    setTimeout(() => setMealFeedback(null), 1500);
    const entry: MealEntry = { id: `${Date.now()}`, foodName: food.name, calories: food.calories, emoji: food.emoji, mealType };
    setState(s => s ? { ...s, todayMeals: [...(s.todayMeals || []), entry], lastMealDate: today } : s);
  }

  function handleAddExercise(ex: typeof EXERCISES[0], minutes: number) {
    const cal = calcExerciseCalories(w, ex.metPerHour, minutes);
    const entry: ExerciseEntry = { id: `${Date.now()}`, name: ex.name, emoji: ex.emoji, minutes, calories: cal };
    setState(s => s ? { ...s, todayExercises: [...(s.todayExercises || []), entry], lastExerciseDate: today } : s);
    setSelectedExercise(null); triggerReact();
  }

  function checkBadges(ns: GotchiState) {
    const newIds = getUnlockedIds(ns);
    const justUnlocked = newIds.find(id => !prevUnlockedRef.current.includes(id));
    if (justUnlocked) {
      const item = COLLECTION.find(c => c.id === justUnlocked);
      if (item) {
        // キャラ解放ならキャラ名を通知、バッジのみなら実績名を通知
        const unlockedChar = CHARACTERS.find(c => c.unlockId === justUnlocked);
        const msg = unlockedChar
          ? `🎉 ${unlockedChar.emoji} ${unlockedChar.name} 解放！`
          : `${item.emoji} ${item.name} 達成！`;
        setNewBadge(msg);
        setTimeout(() => setNewBadge(null), 3000);
      }
    }
    prevUnlockedRef.current = newIds;
  }

  function handleShare() {
    if (!state) return;
    const text = `【PIXFIT ダイエット記録】\n体重：${state.weight || "未入力"}kg　${stageInfo.label}\n${state.streak > 0 ? `🔥${state.streak}日連続！` : ""}\nhttps://gotchi-two.vercel.app\n#PIXFIT #ダイエット`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }

  const idleClass = eating ? "animate-eating"
    : reacting ? "animate-bounce-char"
    : stage === 4 ? "animate-idle-sway"
    : stage === 5 ? "animate-idle-pulse"
    : stage === 0 ? "animate-idle-float"
    : moodInfo.animClass;

  const MiniChar = () => (
    <div className={idleClass} style={{ display: "inline-block", position: "relative" }}>
      <PixelCanvas pixels={pixels} scale={2} glowClass={stageInfo.glowClass} />
      {flyFoods.map(f => (
        <span key={f.id} className="animate-float-up text-lg"
          style={{ position: "absolute", left: "50%", bottom: "36px" }}>{f.emoji}</span>
      ))}
    </div>
  );

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: "char",     icon: charDef?.emoji ?? "🐐", label: "キャラ"    },
    { id: "record",   icon: "📝",                   label: "記録"      },
    { id: "food",     icon: "🍽️",                  label: "食事"      },
    { id: "exercise", icon: "🏃",                   label: "運動"      },
    { id: "mypage",   icon: "⭐",                   label: "マイページ" },
  ];

  const TAB_PAD = "calc(68px + env(safe-area-inset-bottom, 0px))";

  // ── 記録履歴サブ画面 ─────────────────────────────────────────────────────
  if (tab === "record" && recordSubView === "history") {
    const allSorted = [...state.log].sort((a, b) => a.date.localeCompare(b.date));

    // 期間フィルター
    const getWeekBounds = (offset: number) => {
      const today = new Date(); today.setHours(0,0,0,0);
      const mon = new Date(today); mon.setDate(today.getDate() - ((today.getDay()+6)%7) + offset*7);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return { mon, sun };
    };
    const getMonthBase = (offset: number) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + offset);
      return { y: d.getFullYear(), m: d.getMonth() + 1 };
    };
    const parseDate = (s: string) => { const [y,m,d] = s.split('/').map(Number); return new Date(y,m-1,d); };

    const filtered = (() => {
      if (graphPeriod === "month") {
        const { y, m } = getMonthBase(graphMonthOffset);
        const prefix = `${y}/${String(m).padStart(2,'0')}`;
        return allSorted.filter(e => e.date.startsWith(prefix));
      }
      if (graphPeriod === "week") {
        const { mon, sun } = getWeekBounds(graphWeekOffset);
        return allSorted.filter(e => { const d = parseDate(e.date); return d >= mon && d <= sun; });
      }
      return allSorted;
    })();

    const periodLabel = (() => {
      if (graphPeriod === "month") { const { y, m } = getMonthBase(graphMonthOffset); return `${y}年${m}月`; }
      if (graphPeriod === "week") { const { mon, sun } = getWeekBounds(graphWeekOffset); return `${mon.getMonth()+1}/${mon.getDate()}〜${sun.getMonth()+1}/${sun.getDate()}`; }
      return "全期間";
    })();

    const GraphView = () => {
      if (filtered.length < 2) return (
        <p style={{ color: "var(--text-dim)", fontSize: "13px", textAlign: "center", padding: "28px 0" }}>
          {filtered.length === 0 ? "この期間に記録がありません" : "記録が2件以上になるとグラフが表示されます"}
        </p>
      );
      const W = 320, H = 170;
      const pad = { t: 16, r: 28, b: 32, l: 44 };
      const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
      const weights = filtered.map(e => e.weight);
      const tw = Number(state.targetWeight) || 0;
      const allVals = tw > 0 ? [...weights, tw] : weights;
      const rawMin = Math.min(...allVals), rawMax = Math.max(...allVals);
      const span = rawMax - rawMin || 2;
      const minW = rawMin - span * 0.15, maxW = rawMax + span * 0.15;
      const range = maxW - minW;
      const px = (i: number) => pad.l + (i / Math.max(filtered.length - 1, 1)) * iW;
      const py = (w: number) => pad.t + iH - ((w - minW) / range) * iH;
      const yTicks = Array.from({ length: 5 }, (_, i) => minW + (range / 4) * i);
      const step = Math.max(1, Math.ceil(filtered.length / 5));
      const linePath = filtered.map((e, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)} ${py(e.weight).toFixed(1)}`).join(' ');
      return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
          {yTicks.map((w, i) => (
            <g key={i}>
              <line x1={pad.l} y1={py(w).toFixed(1)} x2={W - pad.r} y2={py(w).toFixed(1)} stroke="#2a2a2a" strokeWidth="1" />
              <text x={pad.l - 5} y={py(w) + 4} textAnchor="end" fontSize="9" fill="#666">{w.toFixed(1)}</text>
            </g>
          ))}
          {tw > 0 && <>
            <line x1={pad.l} y1={py(tw).toFixed(1)} x2={W - pad.r} y2={py(tw).toFixed(1)} stroke="#98d8c8" strokeWidth="1.5" strokeDasharray="5 3" />
            <text x={W - pad.r + 3} y={py(tw) + 4} fontSize="8" fill="#98d8c8">目標</text>
          </>}
          <path d={linePath} fill="none" stroke="#f4c87a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {filtered.map((e, i) => <circle key={i} cx={px(i).toFixed(1)} cy={py(e.weight).toFixed(1)} r="3.5" fill="#f4c87a" />)}
          {filtered.map((e, i) => {
            if (i % step !== 0 && i !== filtered.length - 1) return null;
            const parts = e.date.split('/');
            return <text key={i} x={px(i).toFixed(1)} y={H - 4} textAnchor="middle" fontSize="9" fill="#666">{parseInt(parts[1])}/{parseInt(parts[2])}</text>;
          })}
        </svg>
      );
    };

    const CalView = () => {
      const { y, m } = calMonth;
      const firstDay = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const logMap = new Map(state.log.map(e => [e.date, e]));
      const cells: Array<{ d: number; dateStr: string } | null> = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          return { d, dateStr: `${y}/${String(m + 1).padStart(2, '0')}/${String(d).padStart(2, '0')}` };
        }),
      ];
      while (cells.length % 7 !== 0) cells.push(null);
      const todayStr2 = todayStr();
      return (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <button onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m - 1); return { y: d.getFullYear(), m: d.getMonth() }; })}
              style={{ background: "var(--border)", border: "none", color: "var(--text)", fontFamily: "inherit", width: "34px", height: "34px", borderRadius: "8px", fontSize: "18px", cursor: "pointer" }}>‹</button>
            <span style={{ color: "var(--text)", fontSize: "14px", fontWeight: "bold" }}>{y}年{m + 1}月</span>
            <button onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m + 1); return { y: d.getFullYear(), m: d.getMonth() }; })}
              style={{ background: "var(--border)", border: "none", color: "var(--text)", fontFamily: "inherit", width: "34px", height: "34px", borderRadius: "8px", fontSize: "18px", cursor: "pointer" }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
            {['日','月','火','水','木','金','土'].map((d, i) => (
              <div key={d} style={{ textAlign: "center", fontSize: "10px", color: i === 0 ? "#e8935a" : i === 6 ? "#a8d8ea" : "var(--text-dim)", padding: "3px 0" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
            {cells.map((cell, i) => {
              if (!cell) return <div key={i} />;
              const entry = logMap.get(cell.dateStr);
              const isToday = cell.dateStr === todayStr2;
              const isSun = i % 7 === 0, isSat = i % 7 === 6;
              return (
                <div key={i} style={{
                  background: entry ? "rgba(244,200,122,0.12)" : "var(--bg)",
                  border: `1px solid ${isToday ? "var(--gold)" : entry ? "rgba(244,200,122,0.35)" : "var(--border)"}`,
                  borderRadius: "6px", minHeight: "42px",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1px",
                }}>
                  <span style={{ fontSize: "11px", fontWeight: isToday ? "bold" : "normal", color: isToday ? "var(--gold)" : isSun ? "#e8935a" : isSat ? "#a8d8ea" : "var(--text)" }}>{cell.d}</span>
                  {entry && <span style={{ fontSize: "9px", color: "var(--gold)", fontWeight: "bold" }}>{entry.weight}kg</span>}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <div style={{ maxWidth: "390px", margin: "0 auto", padding: "18px 20px 10px", display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => { setRecordSubView("main"); setLogShowCount(50); }}
            style={{ color: "var(--gold)", background: "transparent", border: "1px solid var(--border)", fontFamily: "inherit", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", flexShrink: 0 }}>
            ← 戻る
          </button>
          <h2 style={{ color: "var(--gold)", fontSize: "16px", fontWeight: "bold", letterSpacing: "0.1em" }}>記録履歴</h2>
          <span style={{ color: "var(--text-dim)", fontSize: "12px", marginLeft: "auto" }}>{state.log.length}件</span>
        </div>
        <div style={{ maxWidth: "390px", margin: "0 auto", padding: "0 20px 10px" }}>
          <div style={{ display: "flex", gap: "6px", background: "var(--surface)", borderRadius: "12px", padding: "4px" }}>
            {(['graph', 'calendar'] as HistoryTab[]).map(t => (
              <button key={t} onClick={() => setHistoryTab(t)}
                style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", fontFamily: "inherit", fontSize: "13px", fontWeight: "bold", cursor: "pointer", background: historyTab === t ? "var(--gold)" : "transparent", color: historyTab === t ? "#0d0d0d" : "var(--text-dim)" }}>
                {t === "graph" ? "📈 グラフ" : "📅 カレンダー"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: "390px", margin: "0 auto", padding: "0 20px 28px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px 16px" }}>
            {historyTab === "graph" && <>
              <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "10px" }}>
                体重推移　{state.targetWeight && <span style={{ color: "var(--green)", fontWeight: "normal" }}>— — 目標 {state.targetWeight}kg</span>}
              </p>
              {/* 期間選択 */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
                {([["all","全期間"], ["month","月"], ["week","週"]] as const).map(([p, label]) => (
                  <button key={p} onClick={() => { setGraphPeriod(p); setGraphMonthOffset(0); setGraphWeekOffset(0); }}
                    style={{ flex: 1, padding: "6px 4px", border: `1px solid ${graphPeriod === p ? "var(--gold)" : "var(--border)"}`, borderRadius: "8px", fontFamily: "inherit", fontSize: "12px", fontWeight: "bold", cursor: "pointer", background: graphPeriod === p ? "rgba(244,200,122,0.12)" : "transparent", color: graphPeriod === p ? "var(--gold)" : "var(--text-dim)" }}>
                    {label}
                  </button>
                ))}
              </div>
              {/* 月・週のナビゲーター */}
              {graphPeriod !== "all" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <button onClick={() => graphPeriod === "month" ? setGraphMonthOffset(o => o - 1) : setGraphWeekOffset(o => o - 1)}
                    style={{ background: "var(--border)", border: "none", color: "var(--text)", fontFamily: "inherit", width: "32px", height: "32px", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}>‹</button>
                  <span style={{ color: "var(--text)", fontSize: "13px", fontWeight: "bold" }}>{periodLabel}</span>
                  <button onClick={() => graphPeriod === "month" ? setGraphMonthOffset(o => Math.min(o + 1, 0)) : setGraphWeekOffset(o => Math.min(o + 1, 0))}
                    style={{ background: "var(--border)", border: "none", color: "var(--text)", fontFamily: "inherit", width: "32px", height: "32px", borderRadius: "8px", fontSize: "16px", cursor: "pointer", opacity: (graphPeriod === "month" ? graphMonthOffset : graphWeekOffset) >= 0 ? 0.3 : 1 }}>›</button>
                </div>
              )}
              <GraphView />
            </>}
            {historyTab === "calendar" && <CalView />}
          </div>
          {state.log.length > 0 && (() => {
            const sortedLog = [...state.log].sort((a, b) => b.date.localeCompare(a.date));
            const visible = sortedLog.slice(0, logShowCount);
            const hasMore = sortedLog.length > logShowCount;
            return (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px 16px" }}>
                <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "10px" }}>
                  全記録　<span style={{ color: "var(--text-dim)", fontWeight: "normal" }}>{visible.length}/{state.log.length}件表示</span>
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {visible.map((entry, i) => (
                    <div key={i} style={{ borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", paddingBottom: "6px", fontSize: "12px" }}>
                      <span style={{ color: "var(--text-dim)", flexShrink: 0 }}>{entry.date}</span>
                      <span style={{ color: "var(--text)", fontWeight: "bold" }}>{entry.weight}kg</span>
                      <span style={{ color: "var(--text-dim)" }}>{entry.steps.toLocaleString()}歩</span>
                      {entry.bmi > 0 && <span style={{ color: "var(--text-dim)" }}>BMI {entry.bmi}</span>}
                      <span>{getStageInfo(entry.stage as Stage).label.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
                {hasMore && (
                  <button onClick={() => setLogShowCount(c => c + 50)}
                    style={{ marginTop: "12px", width: "100%", padding: "10px", background: "transparent", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-dim)", fontFamily: "inherit", fontSize: "12px", cursor: "pointer" }}>
                    もっと見る（残り{sortedLog.length - logShowCount}件）
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: TAB_PAD }}>

      {newBadge && (
        <div className="animate-pop-in fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-full text-sm font-bold"
          style={{ background: "var(--gold)", color: "#0d0d0d", whiteSpace: "nowrap" }}>
          {newBadge}
        </div>
      )}

      {/* ── CHAR TAB ── */}
      {tab === "char" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 20px 28px", maxWidth: "390px", margin: "0 auto", width: "100%" }}>
          <h1 style={{ color: "var(--gold)", letterSpacing: "0.3em", fontSize: "20px", fontWeight: "bold", marginBottom: "2px" }}>PIXFIT</h1>
          <p style={{ color: "var(--text-dim)", fontSize: "11px", letterSpacing: "0.1em", marginBottom: "12px" }}>
            {charDef?.emoji} {charDef?.name} &nbsp;/&nbsp; {moodInfo.emoji} {moodInfo.label}
          </p>

          {/* Big character card */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", padding: "8px 16px 18px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ position: "relative", marginBottom: "6px", marginTop: "16px" }}>
              <div className={idleClass}>
                <PixelCanvas pixels={pixels} scale={5} glowClass={stageInfo.glowClass} />
              </div>
              {hearts.map(hh => (
                <span key={hh.id} className="animate-float-up"
                  style={{ position: "absolute", fontSize: "24px", left: `calc(50% + ${(hh.id % 5) * 14 - 28}px)`, bottom: "90px" }}>
                  {hh.emoji}
                </span>
              ))}
              {flyFoods.map(f => (
                <span key={f.id} className="animate-float-up"
                  style={{ position: "absolute", fontSize: "24px", left: "50%", bottom: "90px" }}>{f.emoji}</span>
              ))}
            </div>

            <div style={{ color: stageInfo.color, fontSize: "17px", fontWeight: "bold", marginBottom: "4px", letterSpacing: "0.05em" }}>{stageInfo.label}</div>
            <div style={{ color: "var(--text-dim)", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>{serif}</div>

            {/* Quick stats */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", fontSize: "12px", marginBottom: "14px" }}>
              {diff !== null && (
                <span style={{ color: diff <= 0 ? "var(--green)" : "var(--orange)", fontWeight: "bold" }}>
                  {diff <= 0 ? `目標達成🎉 (-${Math.abs(diff).toFixed(1)}kg)` : `あと ${diff.toFixed(1)}kg`}
                </span>
              )}
              {bmi > 0 && <span style={{ color: "var(--text-dim)" }}>BMI {bmi}</span>}
              {state.streak > 0 && <span style={{ color: "var(--gold)", fontWeight: "bold" }}>🔥 {state.streak}日連続</span>}
            </div>

            {/* Care buttons */}
            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <button onClick={handlePet} disabled={state.petCountToday >= MAX_PETS}
                style={{
                  flex: 1, minHeight: "64px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px",
                  border: `2px solid ${state.petCountToday < MAX_PETS ? "var(--gold)" : "var(--border)"}`,
                  color: state.petCountToday < MAX_PETS ? "var(--gold)" : "var(--text-dim)",
                  fontFamily: "inherit", background: "transparent", borderRadius: "12px", cursor: "pointer",
                }}>
                <span style={{ fontSize: "22px" }}>🖐</span>
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>なでる</span>
                <span style={{ fontSize: "11px" }}>{state.petCountToday}/{MAX_PETS}</span>
              </button>
              <button onClick={() => setTab("food")}
                style={{
                  flex: 1, minHeight: "64px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px",
                  border: "2px solid var(--border)", color: "var(--text-dim)",
                  fontFamily: "inherit", background: "transparent", borderRadius: "12px", cursor: "pointer",
                }}>
                <span style={{ fontSize: "22px" }}>🍖</span>
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>エサあげる</span>
              </button>
            </div>
          </div>

          {/* Mission card */}
          <div style={{ background: "var(--surface)", border: `2px solid ${missionDone ? "var(--green)" : "var(--border)"}`, borderRadius: "16px", overflow: "hidden", padding: "14px 16px 16px", width: "100%", marginBottom: "10px" }}>
            <p style={{ color: "var(--gold)", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.15em", textAlign: "center", marginBottom: "12px" }}>TODAY&apos;S MISSION</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ fontSize: "22px" }}>{mission.emoji}</span>
              <span style={{ color: missionDone ? "var(--green)" : "var(--text)", fontSize: "14px", fontWeight: "bold", lineHeight: 1.3 }}>
                {mission.text}
              </span>
              <span style={{ fontSize: "20px" }}>{missionDone ? "✅" : "⬜"}</span>
            </div>
          </div>

          <button onClick={handleShare}
            style={{ border: "2px solid var(--gold)", color: "var(--gold)", fontFamily: "inherit", background: "transparent", width: "100%", minHeight: "48px", borderRadius: "12px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>
            𝕏 でシェア
          </button>
        </div>
      )}

      {/* ── RECORD TAB ── */}
      {tab === "record" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 20px", maxWidth: "390px", margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: "8px" }}><MiniChar /></div>
          <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.2em", marginBottom: "12px" }}>TODAY&apos;S RECORD</p>

          {/* Weight input */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", padding: "16px 20px 18px", marginBottom: "10px", width: "100%" }}>
            <p style={{ color: "var(--text-dim)", fontSize: "12px", marginBottom: "10px" }}>体重 (kg)</p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 8px" }}>
              <StepBtn label="−" onClick={() => setState(s => s ? { ...s, weight: adjust(s.weight || "60", -0.1, 1) } : s)} />
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <input type="number" inputMode="decimal" value={state.weight}
                  onChange={e => setState(s => s ? { ...s, weight: e.target.value } : s)}
                  placeholder="68.5"
                  style={{ background: "transparent", border: "none", color: "var(--text)", fontFamily: "inherit", textAlign: "center", width: "100%", fontSize: "42px", fontWeight: "bold", outline: "none" }} />
                <p style={{ color: "var(--text-dim)", fontSize: "13px", marginTop: "4px" }}>
                  {bmi > 0 ? `BMI ${bmi}` : "—"}
                </p>
              </div>
              <StepBtn label="＋" onClick={() => setState(s => s ? { ...s, weight: adjust(s.weight || "60", +0.1, 1) } : s)} />
            </div>
          </div>

          {/* Steps input */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", padding: "16px 20px 18px", marginBottom: "10px", width: "100%" }}>
            <p style={{ color: "var(--text-dim)", fontSize: "12px", marginBottom: "10px" }}>今日の歩数</p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 8px" }}>
              <StepBtn label="−" onClick={() => setState(s => s ? { ...s, steps: String(Math.max(0, Number(s.steps || 0) - 500)) } : s)} />
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <input type="number" inputMode="numeric" value={state.steps}
                  onChange={e => setState(s => s ? { ...s, steps: e.target.value } : s)}
                  placeholder="8000"
                  style={{ background: "transparent", border: "none", color: "var(--text)", fontFamily: "inherit", textAlign: "center", width: "100%", fontSize: "42px", fontWeight: "bold", outline: "none" }} />
                <p style={{ color: "var(--text-dim)", fontSize: "13px", marginTop: "4px" }}>
                  {stepsCalories > 0 ? `消費 ${stepsCalories} kcal` : "—"}
                </p>
              </div>
              <StepBtn label="＋" onClick={() => setState(s => s ? { ...s, steps: String(Number(s.steps || 0) + 500) } : s)} />
            </div>
          </div>

          {/* Calorie balance */}
          {(caloriesIn > 0 || totalBurned > 0) && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", padding: "14px 20px 16px", marginBottom: "10px", width: "100%" }}>
              <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "12px" }}>カロリー収支</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "var(--orange)", fontSize: "28px", fontWeight: "bold", lineHeight: 1 }}>{caloriesIn}</p>
                  <p style={{ color: "var(--text-dim)", fontSize: "11px", marginTop: "4px" }}>摂取 kcal</p>
                </div>
                <div style={{ color: "var(--border)", fontSize: "20px" }}>|</div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "var(--green)", fontSize: "28px", fontWeight: "bold", lineHeight: 1 }}>{totalBurned}</p>
                  <p style={{ color: "var(--text-dim)", fontSize: "11px", marginTop: "4px" }}>消費 kcal</p>
                </div>
                <div style={{ color: "var(--border)", fontSize: "20px" }}>|</div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: caloriesIn - totalBurned > 0 ? "var(--red-bright)" : "var(--green)", fontSize: "28px", fontWeight: "bold", lineHeight: 1 }}>
                    {caloriesIn - totalBurned > 0 ? "+" : ""}{caloriesIn - totalBurned}
                  </p>
                  <p style={{ color: "var(--text-dim)", fontSize: "11px", marginTop: "4px" }}>収支 kcal</p>
                </div>
              </div>
            </div>
          )}

          {/* RECORD button */}
          <button onClick={handleRecord} disabled={!state.weight || !state.targetWeight}
            style={{
              background: state.weight && state.targetWeight ? "var(--gold)" : "var(--border)",
              color: state.weight && state.targetWeight ? "#0d0d0d" : "var(--text-dim)",
              fontFamily: "inherit", width: "100%", padding: "16px", borderRadius: "14px",
              fontWeight: "bold", letterSpacing: "0.15em", fontSize: "17px", marginBottom: "10px",
              border: "none", cursor: "pointer",
            }}>
            {saved ? "✓ SAVED!" : "RECORD"}
          </button>

          {!state.targetWeight && (
            <p style={{ color: "var(--text-dim)", fontSize: "12px", textAlign: "center", marginBottom: "10px" }}>
              ※ 目標体重は「マイページ」で設定できます
            </p>
          )}

          {/* 直近3件プレビュー + 全履歴ボタン */}
          {state.log.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "14px 16px", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold" }}>最近の記録</p>
                <span style={{ color: "var(--text-dim)", fontSize: "11px" }}>全{state.log.length}件</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                {[...state.log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((entry, i) => (
                  <div key={i} style={{ borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", paddingBottom: "6px", fontSize: "12px" }}>
                    <span style={{ color: "var(--text-dim)", flexShrink: 0 }}>{entry.date}</span>
                    <span style={{ color: "var(--text)", fontWeight: "bold" }}>{entry.weight}kg</span>
                    <span style={{ color: "var(--text-dim)" }}>{entry.steps.toLocaleString()}歩</span>
                    {entry.bmi > 0 && <span style={{ color: "var(--text-dim)" }}>BMI {entry.bmi}</span>}
                    <span>{getStageInfo(entry.stage as Stage).label.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setRecordSubView("history")}
                style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid var(--gold)", borderRadius: "10px", color: "var(--gold)", fontFamily: "inherit", fontSize: "13px", fontWeight: "bold", cursor: "pointer" }}>
                📊 全履歴を見る（グラフ・カレンダー）
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── FOOD TAB ── */}
      {tab === "food" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 20px", maxWidth: "390px", margin: "0 auto", width: "100%" }}>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <MiniChar />
            {mealFeedback && (
              <div className="animate-float-up" style={{ position: "absolute", top: "-24px", left: "50%", transform: "translateX(-50%)", color: "var(--orange)", fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                {mealFeedback}
              </div>
            )}
          </div>

          {/* Calorie summary */}
          {(caloriesIn > 0 || totalBurned > 0) && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", padding: "12px 14px", width: "100%", marginBottom: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
                <CalCard label="摂取" value={caloriesIn} color="var(--orange)" />
                <CalCard label="消費" value={totalBurned} color="var(--green)" />
                <CalCard label="収支" value={caloriesIn - totalBurned} color={caloriesIn - totalBurned > 0 ? "var(--red-bright)" : "var(--green)"} showSign />
              </div>
            </div>
          )}

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", padding: "14px 16px", width: "100%", marginBottom: "10px" }}>
            <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "12px" }}>食事を追加</p>

            {/* Meal type */}
            <p style={{ color: "var(--text-dim)", fontSize: "11px", marginBottom: "6px" }}>食事の種類</p>
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {MEAL_TYPES.map(mt => (
                <button key={mt} onClick={() => setMealType(mt)}
                  style={{
                    flex: 1, padding: "8px 4px", border: `2px solid ${mealType === mt ? "var(--gold)" : "var(--border)"}`,
                    color: mealType === mt ? "var(--gold)" : "var(--text-dim)",
                    fontFamily: "inherit", background: mealType === mt ? "rgba(244,200,122,0.08)" : "transparent",
                    borderRadius: "10px", fontSize: "13px", fontWeight: "bold", cursor: "pointer",
                  }}>{mt}</button>
              ))}
            </div>

            {/* Category filter */}
            <p style={{ color: "var(--text-dim)", fontSize: "11px", marginBottom: "6px" }}>カテゴリ</p>
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px", overflowX: "auto", paddingBottom: "2px" }}>
              {FOOD_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFoodCat(cat)}
                  style={{
                    padding: "6px 12px", border: `1px solid ${foodCat === cat ? "var(--gold)" : "var(--border)"}`,
                    color: foodCat === cat ? "var(--gold)" : "var(--text-dim)",
                    fontFamily: "inherit", background: foodCat === cat ? "rgba(244,200,122,0.08)" : "transparent",
                    whiteSpace: "nowrap", borderRadius: "20px", fontSize: "12px", fontWeight: "bold",
                    flexShrink: 0, cursor: "pointer",
                  }}>{cat}</button>
              ))}
            </div>

            {/* Food grid — 3 columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {filteredFoods.map(food => (
                <button key={`${food.name}-${food.category}`} onClick={() => handleAddMeal(food)}
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", fontFamily: "inherit", borderRadius: "12px", padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minHeight: "82px", justifyContent: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "26px", lineHeight: 1 }}>{food.emoji}</span>
                  <span style={{ color: "var(--text)", fontSize: "11px", lineHeight: 1.2, textAlign: "center", width: "100%" }}>{food.name}</span>
                  <span style={{ color: food.calories > 0 ? "var(--orange)" : "var(--text-dim)", fontSize: "11px", fontWeight: "bold" }}>
                    {food.calories}kcal
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Today's meals */}
          {(state.todayMeals || []).length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", padding: "14px 16px", width: "100%" }}>
              <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "10px" }}>今日の食事</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {(state.todayMeals || []).map(meal => (
                  <div key={meal.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "20px", flexShrink: 0 }}>{meal.emoji}</span>
                    <span style={{ color: "var(--text-dim)", fontSize: "12px", width: "24px", flexShrink: 0 }}>{meal.mealType}</span>
                    <span style={{ color: "var(--text)", fontSize: "12px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meal.foodName}</span>
                    <span style={{ color: "var(--orange)", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>{meal.calories}</span>
                    <button
                      onClick={() => setState(s => s ? { ...s, todayMeals: s.todayMeals.filter(m => m.id !== meal.id) } : s)}
                      style={{ color: "var(--text-dim)", background: "transparent", border: "none", fontFamily: "inherit", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0, borderRadius: "8px", cursor: "pointer" }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EXERCISE TAB ── */}
      {tab === "exercise" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 20px", maxWidth: "390px", margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: "8px" }}><MiniChar /></div>

          {/* Summary */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", padding: "12px 14px", width: "100%", marginBottom: "10px" }}>
            <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "10px" }}>消費カロリー</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
              <CalCard label="歩数" value={stepsCalories} color="var(--green)" />
              <CalCard label="運動" value={exerciseCalories} color="var(--green)" />
              <CalCard label="合計" value={totalBurned} color="var(--gold)" />
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", padding: "14px 16px", width: "100%", marginBottom: "10px" }}>
            <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "12px" }}>運動を選択</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              {EXERCISES.map(ex => (
                <button key={ex.name} onClick={() => setSelectedExercise(selectedExercise?.name === ex.name ? null : ex)}
                  style={{
                    background: selectedExercise?.name === ex.name ? "var(--gold)" : "var(--bg)",
                    border: `1px solid ${selectedExercise?.name === ex.name ? "var(--gold)" : "var(--border)"}`,
                    color: selectedExercise?.name === ex.name ? "#0d0d0d" : "var(--text-dim)",
                    fontFamily: "inherit", borderRadius: "10px", padding: "8px 4px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                    minHeight: "72px", justifyContent: "center", cursor: "pointer",
                  }}>
                  <span style={{ fontSize: "22px" }}>{ex.emoji}</span>
                  <span style={{ fontSize: "10px", lineHeight: 1.2, textAlign: "center" }}>{ex.name}</span>
                  <span style={{ fontSize: "10px" }}>{Math.round((w || 65) * ex.metPerHour / 2)}/30分</span>
                </button>
              ))}
            </div>

            {selectedExercise && (
              <div className="animate-pop-in">
                <p style={{ color: "var(--gold)", fontSize: "12px", textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}>
                  {selectedExercise.emoji} {selectedExercise.name} — 時間を選んでタップ
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {DURATION_OPTIONS.map(min => {
                    const cal = calcExerciseCalories(w, selectedExercise.metPerHour, min);
                    return (
                      <button key={min} onClick={() => handleAddExercise(selectedExercise, min)}
                        style={{ background: "var(--bg)", border: "2px solid var(--gold)", color: "var(--gold)", fontFamily: "inherit", borderRadius: "10px", padding: "10px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", cursor: "pointer" }}>
                        <span style={{ fontSize: "14px", fontWeight: "bold" }}>{min}分</span>
                        <span style={{ color: "var(--text-dim)", fontSize: "11px" }}>-{cal}kcal</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {(state.todayExercises || []).length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", padding: "14px 16px", width: "100%" }}>
              <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "10px" }}>今日の運動</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {(state.todayExercises || []).map(ex => (
                  <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "20px", flexShrink: 0 }}>{ex.emoji}</span>
                    <span style={{ color: "var(--text)", fontSize: "13px", flex: 1 }}>{ex.name}</span>
                    <span style={{ color: "var(--text-dim)", fontSize: "12px", flexShrink: 0 }}>{ex.minutes}分</span>
                    <span style={{ color: "var(--green)", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>-{ex.calories}kcal</span>
                    <button onClick={() => setState(s => s ? { ...s, todayExercises: s.todayExercises.filter(e => e.id !== ex.id) } : s)}
                      style={{ color: "var(--text-dim)", background: "transparent", border: "none", fontFamily: "inherit", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0, borderRadius: "8px", cursor: "pointer" }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MYPAGE TAB ── */}
      {tab === "mypage" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 20px", maxWidth: "390px", margin: "0 auto", width: "100%" }}>
          <h2 style={{ color: "var(--gold)", letterSpacing: "0.15em", fontSize: "18px", fontWeight: "bold", marginBottom: "14px" }}>MY PAGE</h2>

          {/* Stats */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", padding: "14px 16px", width: "100%", marginBottom: "10px" }}>
            <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "12px" }}>ステータス</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "連続記録", value: state.streak, unit: "日" },
                { label: "なで回数", value: state.totalPets, unit: "回" },
                { label: "ミッション", value: state.missionsCompleted, unit: "回" },
                { label: "記録件数", value: state.log.length, unit: "件" },
              ].map(item => (
                <div key={item.label} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <p style={{ color: "var(--gold)", fontSize: "26px", fontWeight: "bold" }}>{item.value}</p>
                  <p style={{ color: "var(--text-dim)", fontSize: "11px", marginTop: "4px" }}>{item.label}（{item.unit}）</p>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", padding: "14px 16px", width: "100%", marginBottom: "10px" }}>
            <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "12px" }}>目標・プロフィール</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <LabelInput label="目標体重 (kg)" value={state.targetWeight} onChange={v => setState(s => s ? { ...s, targetWeight: v } : s)} placeholder="65.0" step={0.1} decimals={1} />
              <LabelInput label="身長 (cm)"     value={state.height}       onChange={v => setState(s => s ? { ...s, height: v } : s)}       placeholder="170"  step={1}   decimals={0} />
            </div>
          </div>

          {/* Character change */}
          <button onClick={() => setMypageView("charChange")}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", fontFamily: "inherit", textAlign: "left", width: "100%", minHeight: "60px", borderRadius: "14px", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <PixelCanvas pixels={pixels} scale={2} />
              <div>
                <p style={{ color: "var(--text)", fontSize: "14px", fontWeight: "bold" }}>キャラクター変更</p>
                <p style={{ color: "var(--text-dim)", fontSize: "12px" }}>現在: {charDef?.emoji} {charDef?.name}</p>
              </div>
            </div>
            <span style={{ color: "var(--text-dim)", fontSize: "18px" }}>›</span>
          </button>

          {/* Collection */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", padding: "14px 16px", width: "100%", marginBottom: "10px" }}>
            <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: "bold", marginBottom: "12px" }}>コレクション</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {COLLECTION.map(item => {
                const unlocked = unlockedIds.includes(item.id);
                return (
                  <div key={item.id} title={item.hint}
                    style={{ background: "var(--bg)", border: `1px solid ${unlocked ? "var(--gold)" : "var(--border)"}`, borderRadius: "12px", padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "30px", opacity: unlocked ? 1 : 0.2, filter: unlocked ? "none" : "grayscale(1)" }}>{item.emoji}</span>
                    <span style={{ color: unlocked ? "var(--gold)" : "var(--text-dim)", fontSize: "11px", textAlign: "center", fontWeight: "bold", lineHeight: 1.3 }}>{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => { if (confirm("全データをリセットしますか？")) setState(INITIAL_STATE); }}
            style={{ border: "1px solid var(--border)", color: "var(--text-dim)", fontFamily: "inherit", background: "transparent", width: "100%", minHeight: "44px", borderRadius: "12px", fontSize: "13px", marginBottom: "8px", cursor: "pointer" }}>
            データをリセット
          </button>
          <p style={{ color: "var(--text-dim)", fontSize: "11px", textAlign: "center" }}>データはこのデバイスのみに保存されます</p>
        </div>
      )}

      {/* ── Bottom tab bar ── */}
      <nav className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)}
            style={{ color: tab === t.id ? "var(--gold)" : "var(--text-dim)" }}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── Utility components ────────────────────────────────────────────────────

function adjust(val: string, delta: number, decimals: number): string {
  return (Math.round((parseFloat(val || "0") + delta) * 10 ** decimals) / 10 ** decimals).toFixed(decimals);
}

function StepBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ background: "var(--border)", color: "var(--text)", fontFamily: "inherit", border: "none" }}
      className="w-14 h-14 rounded-xl text-2xl font-bold shrink-0 active:scale-90 transition-transform">
      {label}
    </button>
  );
}

function LabelInput({ label, value, onChange, placeholder, step, decimals }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; step: number; decimals: number;
}) {
  return (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "10px 14px 14px" }}>
      <p style={{ color: "var(--text-dim)", fontSize: "11px", marginBottom: "8px" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button onClick={() => onChange(adjust(value || placeholder, -step, decimals))}
          style={{ background: "var(--border)", color: "var(--text)", border: "none", fontFamily: "inherit", width: "44px", height: "44px", borderRadius: "10px", fontSize: "20px", fontWeight: "bold", flexShrink: 0, cursor: "pointer" }}>−</button>
        <input type="number" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ flex: 1, background: "transparent", border: "none", color: "var(--text)", fontFamily: "inherit", textAlign: "center", fontSize: "32px", fontWeight: "bold", outline: "none" }} />
        <button onClick={() => onChange(adjust(value || placeholder, +step, decimals))}
          style={{ background: "var(--border)", color: "var(--text)", border: "none", fontFamily: "inherit", width: "44px", height: "44px", borderRadius: "10px", fontSize: "20px", fontWeight: "bold", flexShrink: 0, cursor: "pointer" }}>＋</button>
      </div>
    </div>
  );
}

function CalCard({ label, value, color, showSign }: { label: string; value: number; color: string; showSign?: boolean }) {
  return (
    <div>
      <p style={{ color }} className="text-2xl font-bold">
        {showSign && value > 0 ? "+" : ""}{value}
      </p>
      <p style={{ color: "var(--text-dim)" }} className="text-xs mt-0.5">{label}</p>
      <p style={{ color: "var(--text-dim)" }} className="text-xs">kcal</p>
    </div>
  );
}
