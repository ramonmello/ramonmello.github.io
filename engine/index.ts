import { initWebGLContext } from "./core/WebGLContext";
import { startEngine, stopEngine } from "./core/Engine";
import type { KeyboardHandler } from "@/hooks/useKeyboard";

let disposer: (() => void) | undefined;

/**
 * Inicia o jogo:
 * 1) cria o contexto WebGL (singleton)
 * 2) carrega e compila os shaders
 * 3) chama startEngine(keyboard) que inicia o loop
 */
export async function start(
  canvasEl: HTMLCanvasElement,
  keyboard: KeyboardHandler
) {
  await initWebGLContext(canvasEl);
  disposer = await startEngine(keyboard);
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
