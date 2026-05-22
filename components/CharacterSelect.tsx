"use client";

import { CHARACTERS, getCharPixels } from "@/lib/characters";
import PixelCanvas from "./PixelCanvas";

interface Props {
  onSelect: (characterId: string) => void;
}

export default function CharacterSelect({ onSelect }: Props) {
  return (
    <main
      style={{ background: "var(--bg)", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center py-8 px-4"
    >
      <h1 style={{ color: "var(--gold)", letterSpacing: "0.3em" }} className="text-3xl font-bold mb-1">
        GOTCHI
      </h1>
      <p style={{ color: "var(--text-dim)" }} className="text-xs mb-2 tracking-widest">
        DIET VERSION
      </p>
      <p style={{ color: "var(--text)" }} className="text-sm mb-8">
        キャラクターを選んでね
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {CHARACTERS.filter(c => !c.unlockId).map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char.id)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              fontFamily: "inherit",
            }}
            className="rounded-2xl p-5 flex items-center gap-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div className="glow-static shrink-0">
              <PixelCanvas pixels={getCharPixels(char.id, 1)} scale={2} />
            </div>
            <div>
              <div style={{ color: "var(--gold)" }} className="text-base font-bold mb-1">
                {char.emoji} {char.name}
              </div>
              <div style={{ color: "var(--text-dim)" }} className="text-xs leading-relaxed">
                {char.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
