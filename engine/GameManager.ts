import { Game, GameConfig } from "@/engine/games/base/Game";
import { InputSystem } from "@/engine/core/input/InputSystem";
import { KeyboardInputSystem } from "@/engine/core/input/KeyboardInputSystem";
import { MessageBus } from "@/engine/core/messaging/MessageBus";
import {
  initWebGLContext,
  clearWebGLContext,
} from "@/engine/core/rendering/WebGLContext";
import type { KeyboardHandler } from "@/hooks/useKeyboard";

export class GameManager {
  private static instance: GameManager;

  private activeGame?: Game;

  private inputSystem?: InputSystem;

  private animFrameId?: number;

  private lastTime: number = 0;

  private isRunning: boolean = false;

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  private constructor() {}

  async rebindCanvas(canvas: HTMLCanvasElement): Promise<void> {
    clearWebGLContext();
    await initWebGLContext(canvas);
  }

  /**
   * Inicia um jogo
   * @param game Instância do jogo a ser iniciado
   * @param canvas Elemento canvas para renderização
   * @param config Configuração opcional para o jogo
   * @returns Função para parar o jogo
   */
  async startGame(
    game: Game,
    canvas: HTMLCanvasElement,
    config?: Partial<GameConfig>
  ): Promise<() => void> {
    if (!this.inputSystem) throw new Error("InputSystem não configurado");

    await initWebGLContext(canvas);

    if (!this.hasActiveGame()) {
      await game.initialize(undefined, config);
      game.setInputSystem(this.inputSystem);
      this.activeGame = game;
      this.startGameLoop();
      game.start();
    } else {
      this.startGameLoop();
      game.resume();
    }

    return () => this.pauseGame();
  }

  setInputHandler(keyboard: KeyboardHandler): void {
    this.inputSystem = new KeyboardInputSystem(keyboard);
    if (this.activeGame) {
      this.activeGame.setInputSystem(this.inputSystem);
    }
  }

  private startGameLoop(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    this.lastTime = performance.now() / 1000;

    const loop = (timestamp: number) => {
      if (!this.isRunning) return;

      const now = timestamp / 1000;

      const deltaTime = now - this.lastTime;

      this.lastTime = now;

      this.inputSystem?.update();

      if (this.activeGame) {
        this.activeGame.getWorld().update(deltaTime);
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private stopGameLoop(): void {
    if (!this.isRunning) return;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = undefined;
    }

    this.isRunning = false;
  }

  stopGame(): void {
    this.stopGameLoop();

    if (this.activeGame) {
      this.activeGame.stop();
      this.activeGame = undefined;
    }

    MessageBus.getInstance().clearAllListeners();
  }

  pauseGame(): void {
    if (this.activeGame) {
      this.activeGame.pause();
      this.stopGameLoop();
    }
  }

  resumeGame(): void {
    if (this.activeGame) {
      this.activeGame.resume();
      this.startGameLoop();
    }
  }

  getActiveGame(): Game | undefined {
    return this.activeGame;
  }

  hasActiveGame(): boolean {
    return this.activeGame !== undefined;
  }
}
