import { World } from "@/engine/core/ecs/base/World";
import { Game, GameConfig } from "./Game";
import { InputSystem } from "@/engine/core/input/InputSystem";
import { GAME_EVENTS } from "@/engine/core/messaging/MessageTypes";

/**
 * Implementação base para jogos
 * Fornece funcionalidades comuns para todos os jogos
 */
export abstract class BaseGame implements Game {
  /**
   * Nome do jogo - deve ser implementado pelas classes filhas
   */
  abstract name: string;

  /**
   * Descrição do jogo - deve ser implementada pelas classes filhas
   */
  abstract description: string;

  /**
   * Mundo do jogo
   */
  protected world: World;

  /**
   * Configuração do jogo
   */
  protected config: GameConfig;

  /**
   * Indica se o jogo foi inicializado
   */
  protected initialized: boolean = false;

  /**
   * Indica se o jogo está rodando
   */
  protected running: boolean = false;

  /**
   * Sistema de input
   */
  protected inputSystem?: InputSystem;

  /**
   * Construtor que inicializa o mundo e a configuração padrão
   */
  constructor() {
    this.world = new World();
    this.config = this.getDefaultConfig();
  }

  /**
   * Retorna a configuração padrão do jogo
   * Deve ser implementado pelas classes filhas
   */
  protected abstract getDefaultConfig(): GameConfig;

  /**
   * Cria sistemas para o jogo
   * Deve ser implementado pelas classes filhas
   */
  protected abstract createSystems(): void;

  /**
   * Cria entidades para o jogo
   * Deve ser implementado pelas classes filhas
   */
  protected abstract createEntities(): void;

  /**
   * Configura o sistema de input para o jogo
   */
  setInputSystem(inputSystem: InputSystem): void {
    this.inputSystem = inputSystem;
  }

  /**
   * Obtém o sistema de input configurado para o jogo
   */
  getInputSystem(): InputSystem | undefined {
    return this.inputSystem;
  }

  /**
   * Inicializa o jogo
   * @param world Mundo opcional, se não fornecido o jogo cria seu próprio
   * @param config Configuração opcional para o jogo
   */
  async initialize(world?: World, config?: Partial<GameConfig>): Promise<void> {
    // Se um mundo for fornecido, usa esse mundo
    if (world) {
      this.world = world;
    }

    // Mescla a configuração fornecida com a padrão
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Configura sistemas do jogo
    this.createSystems();

    // Configura entidades do jogo
    this.createEntities();

    this.initialized = true;

    // Emite evento de inicialização usando constante
    this.world.emit(GAME_EVENTS.INITIALIZED, { game: this });
  }

  /**
   * Inicia o jogo
   */
  start(): void {
    if (!this.initialized) {
      throw new Error(
        "O jogo não foi inicializado. Chame initialize() primeiro."
      );
    }

    this.world.start();
    this.running = true;

    // Emite evento de início usando constante
    this.world.emit(GAME_EVENTS.STARTED, { game: this });
  }

  /**
   * Pausa o jogo
   */
  pause(): void {
    if (this.running) {
      this.world.stop();
      this.running = false;

      // Emite evento de pausa usando constante
      this.world.emit(GAME_EVENTS.PAUSED, { game: this });
    }
  }

  /**
   * Retoma o jogo de um estado pausado
   */
  resume(): void {
    if (!this.running && this.initialized) {
      this.world.start();
      this.running = true;

      // Emite evento de retomada usando constante
      this.world.emit(GAME_EVENTS.RESUMED, { game: this });
    }
  }

  /**
   * Para o jogo e libera recursos
   */
  stop(): void {
    if (this.initialized) {
      this.world.stop();
      this.running = false;

      // Emite evento de parada usando constante
      this.world.emit(GAME_EVENTS.STOPPED, { game: this });
    }
  }

  /**
   * Reinicia o jogo
   */
  async restart(): Promise<void> {
    this.stop();
    this.world.clear();
    await this.initialize(undefined, this.config);
    this.start();

    // Emite evento de reinício usando constante
    this.world.emit(GAME_EVENTS.RESTARTED, { game: this });
  }

  /**
   * Obtém o mundo do jogo
   */
  getWorld(): World {
    return this.world;
  }

  /**
   * Obtém a configuração atual do jogo
   */
  getConfig(): GameConfig {
    return this.config;
  }

  /**
   * Verifica se o jogo está rodando
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Verifica se o jogo foi inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}
