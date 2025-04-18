"use client";

import { useEffect, useRef } from "react";
// import { start, stop } from "@/engine/legacyEngine";

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stopFn: (() => void) | undefined;

    import("@/engine/legacyEngine").then((engine) => {
      stopFn = engine.start(canvasRef.current!);
    });

    return () => stopFn?.(); // limpa no unmount / HMR
  }, []);

  return (
    <>
      <canvas id="gameCanvas" ref={canvasRef} className="fixed inset-0 block" />

      {/* HUD – Tailwind em vez de CSS inline */}
      <div
        id="asteroidCounter"
        className="fixed top-5 right-5 text-white font-bold text-xl z-10"
      >
        Score: 0
      </div>

      {/* Game Over overlay */}
      <div
        id="gameOverMessage"
        className="hidden fixed inset-0 flex flex-col items-center justify-center text-white text-6xl font-bold z-10"
      >
        GAME OVER
        <div id="gameOverScore" className="text-4xl mt-5">
          Score: 0
        </div>
        <button
          id="playAgainButton"
          className="mt-8 px-6 py-3 text-2xl bg-green-600 hover:bg-green-700 rounded"
        >
          Play Again
        </button>
      </div>

      {/* Carrega o main.js exatamente como no HTML antigo */}
      {/* <Script src="/main.js" strategy="afterInteractive" /> */}
    </>
  );
}
