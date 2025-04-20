import { GameManager } from "./GameManager";
import { Game, GameConfig } from "@/engine/games/base/Game";
import type { KeyboardHandler } from "@/hooks/useKeyboard";
import { initWebGLContext } from "./core/rendering/WebGLContext";
import { asteroidGame } from "./games/asteroid";
import {
  stopEngine as legacyStopEngine,
  resetGame as legacyResetGame,
} from "@/engine/legacy/Engine";

// Função para iniciar o jogo Asteroid na página game
let disposer: (() => void) | undefined;
export async function start(
  canvasEl: HTMLCanvasElement,
  keyboard: KeyboardHandler
) {
  // Inicializa o contexto WebGL
  await initWebGLContext(canvasEl);

  // Inicia o jogo Asteroid usando a nova arquitetura
  disposer = await GameManager.getInstance().startGame(
    asteroidGame,
    canvasEl,
    keyboard
  );

  return () => {
    disposer?.();
    stop();
  };
}

// Função para parar o jogo
export function stop(): void {
  GameManager.getInstance().stopGame();
  legacyStopEngine(); // Mantém compatibilidade com o motor legado
}

/**
 * Reinicia o jogo atual
 */
export function resetGame(): void {
  // Reinicia usando a nova arquitetura
  const manager = GameManager.getInstance();
  const game = manager.getActiveGame();

  if (game) {
    game.restart();
  }

  // Mantém compatibilidade com o motor legado
  legacyResetGame();
}

/**
 * Inicia um jogo usando a nova arquitetura
 * @param game Instância do jogo a ser iniciado
 * @param canvasEl Elemento canvas para renderização
 * @param keyboard Objeto do manipulador de teclado
 * @param config Configuração opcional para o jogo
 * @returns Função para parar o jogo
 */
export async function startGame(
  game: Game,
  canvasEl: HTMLCanvasElement,
  keyboard: KeyboardHandler,
  config?: Partial<GameConfig>
): Promise<() => void> {
  return GameManager.getInstance().startGame(game, canvasEl, keyboard, config);
}

/**
 * Para o jogo atual
 */
export function stopGame(): void {
  GameManager.getInstance().stopGame();
}

/**
 * Pausa o jogo atual
 */
export function pauseGame(): void {
  GameManager.getInstance().pauseGame();
}

/**
 * Retoma o jogo atual
 */
export function resumeGame(): void {
  GameManager.getInstance().resumeGame();
}

/**
 * Re-exportações para facilitar o uso
 */
export * from "@/engine/core/ecs/base/Entity";
export * from "@/engine/core/ecs/base/Component";
export * from "@/engine/core/ecs/base/System";
export * from "@/engine/core/ecs/base/World";
export * from "@/engine/core/messaging/MessageBus";
export * from "@/engine/core/messaging/MessageTypes";
export * from "@/engine/games/base/Game";
export * from "@/engine/games/base/BaseGame";
export * from "@/engine/games/asteroid";
