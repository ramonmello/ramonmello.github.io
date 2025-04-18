/**
 * index.ts - Ponto de entrada para o engine do jogo
 * Exporta as funções principais para iniciar e parar o jogo
 */

import { initWebGLContext } from "./core/WebGLContext";
import { startEngine, stopEngine } from "./core/Engine";

// Função para iniciar o jogo
export async function start(
  canvasElement: HTMLCanvasElement
): Promise<() => void> {
  try {
    // Inicializa o contexto WebGL
    await initWebGLContext(canvasElement);

    // Inicia o motor do jogo
    return startEngine();
  } catch (error) {
    console.error("Error starting game engine:", error);
    return () => {}; // Retorna uma função vazia em caso de erro
  }
}

// Função para parar o jogo
export function stop(): void {
  stopEngine();
}
