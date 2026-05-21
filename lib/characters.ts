type Grid = (string | null)[][];

const _ = null;
const E = '#2d1b00';
const R = '#ff6b6b';
const W = '#fff8e7';
const S = '#f4c87a';
const F = '#f5a623';
const T = '#e8935a';
const B = '#a8d8ea';
const G = '#98d8c8';
const GR = '#888888';
const DK = '#333333';

const EGG: Grid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,W,W,W,W,W,W,_,_,_,_,_],
  [_,_,_,W,W,W,W,W,W,W,W,W,W,_,_,_],
  [_,_,W,W,W,W,W,W,W,W,W,W,W,W,_,_],
  [_,_,W,W,W,W,W,W,W,W,W,W,W,W,_,_],
  [_,_,W,W,W,W,W,W,W,W,W,W,W,W,_,_],
  [_,_,W,W,W,W,W,W,W,W,W,W,W,W,_,_],
  [_,_,W,W,W,W,W,W,W,W,W,W,W,W,_,_],
  [_,_,W,W,W,W,W,W,W,W,W,W,W,W,_,_],
  [_,_,W,W,W,W,W,W,W,W,W,W,W,W,_,_],
  [_,_,_,W,W,W,W,W,W,W,W,W,W,_,_,_],
  [_,_,_,_,_,W,W,W,W,W,W,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const SLIM: Grid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,S,S,E,S,S,E,S,S,_,_,_,_],
  [_,_,_,_,S,S,S,R,S,S,S,S,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,B,S,S,S,S,S,S,B,_,_,_,_],
  [_,_,_,B,B,S,S,S,S,S,S,B,B,_,_,_],
  [_,_,_,_,B,S,S,S,S,S,S,B,_,_,_,_],
  [_,_,_,_,_,S,S,_,_,S,S,_,_,_,_,_],
  [_,_,_,_,_,S,S,_,_,S,S,_,_,_,_,_],
  [_,_,_,_,G,G,G,_,_,G,G,G,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const CHUBBY: Grid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,F,F,F,F,F,F,F,F,_,_,_,_],
  [_,_,_,F,F,F,F,F,F,F,F,F,F,_,_,_],
  [_,_,_,F,F,E,F,F,F,E,F,F,F,_,_,_],
  [_,_,_,F,F,F,F,R,F,F,F,F,F,_,_,_],
  [_,_,_,F,F,F,F,F,F,F,F,F,F,_,_,_],
  [_,_,_,_,F,F,F,F,F,F,F,F,_,_,_,_],
  [_,_,_,B,F,F,F,F,F,F,F,F,B,_,_,_],
  [_,_,B,B,F,F,F,F,F,F,F,F,B,B,_,_],
  [_,_,_,B,F,F,F,F,F,F,F,F,B,_,_,_],
  [_,_,_,_,F,F,F,_,_,F,F,F,_,_,_,_],
  [_,_,_,_,F,F,F,_,_,F,F,F,_,_,_,_],
  [_,_,_,G,G,G,G,_,_,G,G,G,G,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const FAT: Grid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,T,T,T,T,T,T,T,T,T,T,_,_,_],
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_],
  [_,_,T,T,E,T,T,T,T,T,E,T,T,T,_,_],
  [_,_,T,T,T,T,T,R,T,T,T,T,T,T,_,_],
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_],
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_],
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_],
  [_,T,T,T,T,T,T,T,T,T,T,T,T,T,T,_],
  [_,_,T,T,T,T,T,T,T,T,T,T,T,T,_,_],
  [_,_,_,_,T,T,T,_,_,T,T,T,_,_,_,_],
  [_,_,_,_,T,T,T,_,_,T,T,T,_,_,_,_],
  [_,_,_,G,G,G,G,G,G,G,G,G,G,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const ZOMBIE: Grid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,GR,GR,GR,GR,GR,GR,GR,GR,_,_,_,_],
  [_,_,_,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,_,_,_],
  [_,_,_,GR,GR,DK,GR,GR,GR,DK,GR,GR,GR,_,_,_],
  [_,_,_,GR,GR,GR,GR,R,GR,GR,GR,GR,GR,_,_,_],
  [_,_,_,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,_,_,_],
  [_,_,_,_,GR,GR,GR,GR,GR,GR,GR,GR,_,_,_,_],
  [_,_,GR,_,GR,GR,GR,GR,GR,GR,GR,GR,_,GR,_,_],
  [_,GR,GR,_,GR,GR,GR,GR,GR,GR,GR,GR,_,GR,GR,_],
  [_,_,GR,_,GR,GR,GR,GR,GR,GR,GR,GR,_,GR,_,_],
  [_,_,_,_,GR,GR,GR,_,_,GR,GR,GR,_,_,_,_],
  [_,_,_,_,GR,GR,GR,_,_,GR,GR,GR,_,_,_,_],
  [_,_,_,DK,DK,DK,DK,_,_,DK,DK,DK,DK,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const DEAD: Grid = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,DK,DK,DK,DK,DK,DK,_,_,_,_,_],
  [_,_,_,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,_,_,_],
  [_,_,DK,DK,DK,R,DK,DK,DK,R,DK,DK,DK,DK,_,_],
  [_,_,DK,DK,R,DK,R,DK,DK,R,DK,R,DK,DK,_,_],
  [_,_,DK,DK,DK,R,DK,DK,DK,R,DK,DK,DK,DK,_,_],
  [_,_,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,_,_],
  [_,_,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,_,_],
  [_,_,_,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,_,_,_],
  [_,_,_,_,_,DK,DK,_,_,DK,DK,_,_,_,_,_],
  [_,_,_,_,_,DK,DK,_,_,DK,DK,_,_,_,_,_],
  [_,_,_,_,DK,DK,DK,_,_,DK,DK,DK,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const BASE_GRIDS: Grid[] = [EGG, SLIM, CHUBBY, FAT, ZOMBIE, DEAD];

export interface CharacterDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  colorMap: Record<string, string>;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'yagi',
    name: 'やぎ',
    emoji: '🐐',
    description: 'ゼロからビジネスを目指す熱いやぎ',
    colorMap: {},
  },
  {
    id: 'neko',
    name: 'ねこ',
    emoji: '🐱',
    description: 'のんびりやだけど実はがんばるねこ',
    colorMap: {
      [S]: '#ffb7c5',
      [F]: '#e8829a',
      [T]: '#d4607a',
      [B]: '#ffd4e8',
      [G]: '#ff9eb5',
    },
  },
  {
    id: 'kuma',
    name: 'くま',
    emoji: '🐻',
    description: 'のしのし歩くマイペースなくま',
    colorMap: {
      [S]: '#c8a878',
      [F]: '#b08858',
      [T]: '#906840',
      [B]: '#d4b896',
      [G]: '#785030',
    },
  },
];

function applyColorMap(grid: Grid, colorMap: Record<string, string>): Grid {
  if (!Object.keys(colorMap).length) return grid;
  return grid.map(row => row.map(cell => (cell && colorMap[cell]) ? colorMap[cell] : cell));
}

export function getCharPixels(characterId: string, stage: number): Grid {
  const grid = BASE_GRIDS[Math.min(stage, 5)] ?? EGG;
  if (stage === 0 || stage >= 4) return grid;
  const char = CHARACTERS.find(c => c.id === characterId);
  if (!char || !Object.keys(char.colorMap).length) return grid;
  return applyColorMap(grid, char.colorMap);
}
