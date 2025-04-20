"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useKeyboard } from "@/hooks/useKeyboard";
import { floatingAroundGame } from "@/engine/games/floatingAround";
import { GameManager } from "@/engine/GameManager";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keyboard = useKeyboard();

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      if (cancelled || !canvasRef.current) return;

      // Iniciar o jogo FloatingAround
      dispose = await GameManager.getInstance().startGame(
        floatingAroundGame,
        canvasRef.current,
        keyboard
      );

      // Configurar atualização do estado do teclado
      const updateKeyState = () => {
        floatingAroundGame.updateKeyState(keyboard.getState());
        if (!cancelled) {
          requestAnimationFrame(updateKeyState);
        }
      };
      updateKeyState();
    })();

    return () => {
      cancelled = true;
      dispose?.();
      GameManager.getInstance().stopGame();
    };
  }, [keyboard]);

  return (
    <div className="flex flex-col w-full justify-between relative z-10">
      <canvas ref={canvasRef} className="fixed inset-0 block -z-10" />

      <h1 className="text-8xl font-bold md:text-9xl leading-20">Ramon</h1>
      <div className="inline-flex items-center">
        <Image
          className="rounded-full object-cover h-24 -ml-1"
          aria-hidden
          src="/ramon-avatar.jpg"
          alt="Fotografia Ramon Mello"
          width={96}
          height={96}
        />
        <h1 className="text-8xl font-bold md:text-9xl">Mello</h1>
      </div>
      <span className="font-lores-12 self-end text-lg w-full text-end mr-2">
        * Front-end Developer
      </span>
    </div>
  );
}
