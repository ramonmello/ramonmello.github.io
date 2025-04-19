import { initWebGLContext } from "./core/WebGLContext";
import { startEngine, stopEngine } from "./core/Engine";
import type { KeyboardHandler } from "@/hooks/useKeyboard";
import { KeyboardInputSystem } from "./core/input/KeyboardInputSystem";

let disposer: (() => void) | undefined;

/**
 * Inicia o jogo:
 * 1) cria o contexto WebGL (singleton)
 * 2) carrega e compila os shaders
 * 3) cria o sistema de input
 * 4) chama startEngine com o sistema de input
 */
export async function start(
  canvasEl: HTMLCanvasElement,
  keyboard: KeyboardHandler
) {
  await initWebGLContext(canvasEl);
  const inputSystem = new KeyboardInputSystem(keyboard);
  disposer = await startEngine(inputSystem);
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
