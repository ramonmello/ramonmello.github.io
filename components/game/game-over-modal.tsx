"use client";
import { useGameStore } from "@/engine/store/gameStore";

export function GameOverModal({ onPlayAgain }: { onPlayAgain(): void }) {
  const gameOver = useGameStore((s) => s.gameOver);
  const score = useGameStore((s) => s.score);

  if (!gameOver) return null;
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/75 text-white text-6xl font-bold z-20">
      GAME OVER
      <div className="text-4xl mt-5">Score: {score}</div>
      <button
        onClick={onPlayAgain}
        className="mt-8 px-6 py-3 text-2xl bg-green-600 hover:bg-green-700 rounded"
      >
        Play Again
      </button>
    </div>
  );
}
