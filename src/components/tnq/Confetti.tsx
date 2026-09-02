import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = ["#f97316", "#22c55e", "#3b82f6", "#eab308", "#ec4899", "#8b5cf6"];
const PIECE_COUNT = 28;

function Piece({ seed }: { seed: number }) {
  // Deterministic-ish spread per piece so it fans out in a full circle
  // rather than clumping, without needing a random-per-render dependency.
  const angle = (seed / PIECE_COUNT) * Math.PI * 2 + (seed % 3) * 0.15;
  const distance = 130 + ((seed * 37) % 140);
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance - 30;
  const color = COLORS[seed % COLORS.length];
  const size = 6 + (seed % 5);
  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      animate={{ x, y, opacity: 0, rotate: (seed * 53) % 360 }}
      transition={{ duration: 1 + (seed % 4) * 0.1, ease: "easeOut" }}
      style={{
        position: "absolute",
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
    />
  );
}

// Fire a short confetti burst from the center of the screen: bump `fire`
// (e.g. a counter you increment) to trigger a fresh one each time, even on
// repeated successes.
export function Confetti({ fire }: { fire: number }) {
  const [burstId, setBurstId] = useState<number | null>(null);
  useEffect(() => {
    if (fire === 0) return;
    setBurstId(fire);
    const t = setTimeout(() => setBurstId(null), 1300);
    return () => clearTimeout(t);
  }, [fire]);

  if (burstId === null) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-100 flex items-center justify-center">
      <div className="relative">
        {Array.from({ length: PIECE_COUNT }).map((_, i) => (
          <Piece key={`${burstId}-${i}`} seed={i} />
        ))}
      </div>
    </div>
  );
}
