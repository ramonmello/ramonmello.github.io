"use client";
import { useEffect, useState } from "react";
import { GameManager } from "@/engine/GameManager";
import { AsteroidGame } from "@/engine/games/examples/asteroid";
import { useGameStore } from "@/engine/store/gameStore";

export function GameOverModal({ onPlayAgain }: { onPlayAgain(): void }) {
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameOverState = useGameStore((s) => s.gameOver);

  useEffect(() => {
    // Verifica o estado do jogo a cada 100ms
    const interval = setInterval(() => {
      const gameManager = GameManager.getInstance();
      const activeGame = gameManager.getActiveGame();

      if (activeGame && activeGame instanceof AsteroidGame) {
        const isGameOver = activeGame.getGameState() === "gameOver";
        setGameOver(isGameOver || gameOverState);

        if (isGameOver) {
          setScore(activeGame.getScore());
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameOverState]);

  if (!gameOver) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-6xl font-bold z-20">
      GAME OVER
      <div className="text-4xl mt-5">Score: {score}</div>
      <button
        onClick={onPlayAgain}
        className="mt-8 px-6 py-3 text-2xl bg-green-600 hover:bg-green-700 rounded"
      >
        Play Again
      </button>
    </div>
  );
}
