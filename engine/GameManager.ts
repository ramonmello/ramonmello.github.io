import { Game, GameConfig } from "@/engine/games/base/Game";
import { InputSystem } from "@/engine/core/input/InputSystem";
import { KeyboardInputSystem } from "@/engine/core/input/KeyboardInputSystem";
import { MessageBus } from "@/engine/core/messaging/MessageBus";
import {
  initWebGLContext,
  clearWebGLContext,
} from "@/engine/core/rendering/WebGLContext";
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

  /** Reconfigura o canvas no contexto WebGL sem reiniciar o jogo */
  async rebindCanvas(canvas: HTMLCanvasElement): Promise<void> {
    // força a reinicialização do binding do canvas
    clearWebGLContext(); // limpa o singleton interno
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
    // Inicializa / rebind canvas
    await initWebGLContext(canvas);

    // Se for a primeira vez
    if (!this.hasActiveGame()) {
      await game.initialize(undefined, config);
      game.setInputSystem(this.inputSystem);
      this.activeGame = game;
      this.startGameLoop();
      game.start();
    } else {
      // se já havia jogo, apenas rebind e retome loop
      this.startGameLoop();
      game.resume();
    }

    return () => this.pauseGame();
  }

  /** Substitui o InputSystem em runtime */
  setInputHandler(keyboard: KeyboardHandler): void {
    this.inputSystem = new KeyboardInputSystem(keyboard);
    if (this.activeGame) {
      this.activeGame.setInputSystem(this.inputSystem);
    }
  }

  /**
   * Inicia o loop do jogo
   */
  private startGameLoop(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    // 1. Guardamos lastTime em segundos, não mais milissegundos.
    //    performance.now() retorna ms, então dividimos por 1000.
    //    Isso padroniza nossa unidade de tempo para toda a Engine.
    this.lastTime = performance.now() / 1000;

    const loop = (timestamp: number) => {
      if (!this.isRunning) return;

      // 2. Convertemos o timestamp (ms) para segundos, para casar
      //    com a unidade que estamos usando em lastTime.
      const now = timestamp / 1000;

      // 3. Calculamos deltaTime como a diferença, agora em segundos.
      //    É o tempo decorrido desde o último frame.
      const deltaTime = now - this.lastTime;

      // 4. Atualizamos lastTime para o instante atual (em s),
      //    preparando o próximo cálculo de deltaTime.
      this.lastTime = now;

      // 5. Mantemos a chamada ao sistema de input sem mudança,
      //    já que ele não depende de deltaTime.
      this.inputSystem?.update();

      // 6. Passamos deltaTime em segundos para o World.
      //    A partir daqui, todos os sistemas receberão tempo em s.
      if (this.activeGame) {
        this.activeGame.getWorld().update(deltaTime);
      }

      // 7. Solicitamos o próximo frame, mantendo o ciclo.
      this.animFrameId = requestAnimationFrame(loop);
    };

    // 8. Iniciamos o primeiro frame. O callback já faz a conversão.
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
