"use client";
import { useEffect, useState } from "react";
import { GameManager } from "@/engine/GameManager";
import { AsteroidGame } from "@/engine/games/asteroid";

export function ScoreHUD() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    // Atualiza o score a cada 100ms
    const interval = setInterval(() => {
      const gameManager = GameManager.getInstance();
      const activeGame = gameManager.getActiveGame();

      if (activeGame && activeGame instanceof AsteroidGame) {
        setScore(activeGame.getScore());
        setLives(activeGame.getLives());
        setLevel(activeGame.getLevel());
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-5 right-5 text-white font-bold text-xl z-20 flex flex-col gap-2">
      <div>Score: {score}</div>
      <div>Lives: {lives}</div>
      <div>Level: {level}</div>
    </div>
  );
}
