"use client";
import { useEffect, useRef } from "react";
import { useGameStore } from "@/engine/store/gameStore";
import { resetGame } from "@/engine/core/Engine";
import { ScoreHUD } from "@/components/game/score-hud";
import { GameOverModal } from "@/components/game/game-over-modal";
import { useKeyboard } from "@/hooks/useKeyboard";

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keyboard = useKeyboard();

  const resetGameState = useGameStore((s) => s.resetGameState);
  const setGameOver = useGameStore((s) => s.setGameOver);

  const handlePlayAgain = () => {
    resetGame();
  };

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const { start } = await import("@/engine");
      if (cancelled) return;
      resetGameState();
      dispose = await start(canvasRef.current!, keyboard);
    })();

    return () => {
      cancelled = true;
      dispose?.();
      setGameOver(false);
    };
  }, [resetGameState, setGameOver, keyboard]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 block"
        style={{ zIndex: -1, pointerEvents: "none" }}
      />

      <ScoreHUD />
      <GameOverModal onPlayAgain={handlePlayAgain} />
    </>
  );
}
