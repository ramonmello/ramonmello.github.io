// src/engine/index.ts

import { initWebGLContext } from "./core/WebGLContext";
import { startEngine, stopEngine } from "./core/Engine";

let disposer: (() => void) | undefined;

/**
 * Inicia o jogo:
 * 1) cria o contexto WebGL (singleton)
 * 2) carrega e compila os shaders
 * 3) chama startEngine() que inicia o loop
 */
export async function start(canvasEl: HTMLCanvasElement) {
  await initWebGLContext(canvasEl); // já traz shaders prontos
  disposer = await startEngine();
  return () => {
    disposer?.();
    stopEngine();
  };
}

/**
 * Para o motor e limpa listeners
 */
export function stop(): void {
  stopEngine();
}
