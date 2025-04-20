import { Game, GameConfig } from "@/engine/games/base/Game";
import { InputSystem } from "@/engine/core/input/InputSystem";
import { KeyboardInputSystem } from "@/engine/core/input/KeyboardInputSystem";
import { MessageBus } from "@/engine/core/messaging/MessageBus";
import { initWebGLContext } from "@/engine/core/rendering/WebGLContext";
import type { KeyboardHandler } from "@/hooks/useKeyboard";

/**
 * Gerenciador de jogos
 * Controla a execução de jogos, fornecendo um ciclo de jogo unificado
 */
export class GameManager {
  private static instance: GameManager;

  /** Jogo atualmente ativo */
  private activeGame?: Game;

  /** Sistema de input atual */
  private inputSystem?: InputSystem;

  /** ID do requestAnimationFrame */
  private animFrameId?: number;

  /** Tempo da última atualização */
  private lastTime: number = 0;

  /** Indica se o loop do jogo está rodando */
  private isRunning: boolean = false;

  /**
   * Obtém a instância singleton do GameManager
   */
  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  /**
   * Construtor privado para o singleton
   */
  private constructor() {}

  /**
   * Inicia um jogo
   * @param game Instância do jogo a ser iniciado
   * @param canvas Elemento canvas para renderização
   * @param keyboard Objeto do manipulador de teclado
   * @param config Configuração opcional para o jogo
   * @returns Função para parar o jogo
   */
  async startGame(
    game: Game,
    canvas: HTMLCanvasElement,
    keyboard: KeyboardHandler,
    config?: Partial<GameConfig>
  ): Promise<() => void> {
    // Para o jogo atual se houver um
    this.stopGame();

    // Inicializa o contexto WebGL
    await initWebGLContext(canvas);

    // Configura o sistema de input
    this.inputSystem = new KeyboardInputSystem(keyboard);

    // Inicializa o jogo
    await game.initialize(undefined, config);

    // Define o sistema de input no jogo
    game.setInputSystem(this.inputSystem);

    // Define como jogo ativo
    this.activeGame = game;

    // Inicia o loop do jogo
    this.startGameLoop();

    // Inicia o jogo
    game.start();

    // Retorna função para parar o jogo
    return () => this.stopGame();
  }

  /**
   * Inicia o loop do jogo
   */
  private startGameLoop(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (timestamp: number) => {
      if (!this.isRunning) return;

      // Calcula delta de tempo em milissegundos
      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;

      // Atualiza o input se existir
      this.inputSystem?.update();

      // Atualiza o mundo do jogo
      if (this.activeGame) {
        this.activeGame.getWorld().update(deltaTime);
      }

      // Agenda a próxima iteração
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  /**
   * Para o loop do jogo
   */
  private stopGameLoop(): void {
    if (!this.isRunning) return;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = undefined;
    }

    this.isRunning = false;
  }

  /**
   * Para o jogo atual
   */
  stopGame(): void {
    this.stopGameLoop();

    if (this.activeGame) {
      this.activeGame.stop();
      this.activeGame = undefined;
    }

    // Limpa o sistema de mensagens
    MessageBus.getInstance().clearAllListeners();
  }

  /**
   * Pausa o jogo atual
   */
  pauseGame(): void {
    if (this.activeGame) {
      this.activeGame.pause();
      this.stopGameLoop();
    }
  }

  /**
   * Retoma o jogo atual
   */
  resumeGame(): void {
    if (this.activeGame) {
      this.activeGame.resume();
      this.startGameLoop();
    }
  }

  /**
   * Obtém o jogo ativo
   */
  getActiveGame(): Game | undefined {
    return this.activeGame;
  }

  /**
   * Verifica se há um jogo ativo
   */
  hasActiveGame(): boolean {
    return this.activeGame !== undefined;
  }
}
