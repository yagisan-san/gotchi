"use client";

const PIXEL = 4;

interface Props {
  pixels: (string | null)[][];
  scale?: number;
  glowClass?: string;
  animClass?: string;
}

export default function PixelCanvas({ pixels, scale = 2, glowClass = "", animClass = "" }: Props) {
  const size = 16;
  return (
    <div className={`${animClass} ${glowClass} inline-block`} style={{ imageRendering: "pixelated" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, ${PIXEL * scale}px)`,
          gap: 0,
        }}
      >
        {pixels.map((row, y) =>
          row.map((color, x) => (
            <div
              key={`${y}-${x}`}
              style={{
                width: PIXEL * scale,
                height: PIXEL * scale,
                backgroundColor: color ?? "transparent",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
