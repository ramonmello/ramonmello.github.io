"use client";
import { useEffect, useRef } from "react";
import { useGameStore } from "@/engine/store/gameStore";
import { ScoreHUD } from "@/components/game/score-hud";
import { GameOverModal } from "@/components/game/game-over-modal";
import { useKeyboard } from "@/hooks/useKeyboard";
import { GameManager } from "@/engine/GameManager";
import { asteroidGame } from "@/engine/games/asteroid";
import { initWebGLContext } from "@/engine/core/rendering/WebGLContext";

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keyboard = useKeyboard();

  const resetGameState = useGameStore((s) => s.resetGameState);
  const setGameOver = useGameStore((s) => s.setGameOver);

  const handlePlayAgain = () => {
    // Reiniciar o jogo diretamente pelo AsteroidGame
    const game = GameManager.getInstance().getActiveGame();
    if (game) {
      game.restart();
    }
  };

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      if (cancelled || !canvasRef.current) return;

      // Inicializar contexto WebGL
      await initWebGLContext(canvasRef.current);

      // Resetar estado do jogo
      resetGameState();

      // Iniciar o jogo Asteroid diretamente
      dispose = await GameManager.getInstance().startGame(
        asteroidGame,
        canvasRef.current,
        keyboard
      );

      // Configurar observador para o estado de game over
      const gameOverObserver = () => {
        if (asteroidGame.getGameState() === "gameOver") {
          setGameOver(true);
        }
      };

      // Adicionar observer para detectar game over
      const world = asteroidGame.getWorld();
      world.on("gameOver", gameOverObserver);
    })();

    return () => {
      cancelled = true;
      dispose?.();
      GameManager.getInstance().stopGame();
      setGameOver(false);
    };
  }, [resetGameState, setGameOver, keyboard]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 block -z-10 pointer-events-none"
      />

      <ScoreHUD />
      <GameOverModal onPlayAgain={handlePlayAgain} />
    </>
  );
}
