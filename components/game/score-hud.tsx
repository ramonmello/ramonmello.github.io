"use client";
import { useGameStore } from "@/engine/store/gameStore";

export function ScoreHUD() {
  const score = useGameStore((s) => s.score);
  return (
    <div
      id="asteroidCounter"
      className="fixed top-5 right-5 text-white font-bold text-xl z-20"
    >
      Score: {score}
    </div>
  );
}
