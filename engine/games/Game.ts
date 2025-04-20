import { World } from "../core/ecs/World";
import { InputSystem } from "../core/input/InputSystem";

/**
 * Configuração base para jogos
 */
export interface GameConfig {
  /**
   * Largura do canvas em pixels
   */
  canvasWidth: number;

  /**
   * Altura do canvas em pixels
   */
  canvasHeight: number;

  /**
   * Ativa modo de depuração
   */
  debug?: boolean;

  /**
   * Propriedades adicionais específicas de cada jogo
   */
  [key: string]: unknown;
}

/**
 * Interface que define o contrato para todos os jogos
 * Todos os jogos devem implementar esta interface
 */
export interface Game {
  /**
   * Nome do jogo
   */
  name: string;

  /**
   * Descrição do jogo
   */
  description: string;

  /**
   * Inicializa o jogo
   * @param world Mundo opcional, se não fornecido o jogo cria seu próprio
   * @param config Configuração opcional para o jogo
   */
  initialize(world?: World, config?: Partial<GameConfig>): Promise<void>;

  /**
   * Inicia o jogo
   */
  start(): void;

  /**
   * Pausa o jogo
   */
  pause(): void;

  /**
   * Retoma o jogo de um estado pausado
   */
  resume(): void;

  /**
   * Para o jogo e libera recursos
   */
  stop(): void;

  /**
   * Reinicia o jogo
   */
  restart(): Promise<void>;

  /**
   * Configura o sistema de input a ser usado pelo jogo
   */
  setInputSystem(inputSystem: InputSystem): void;

  /**
   * Obtém o mundo do jogo
   */
  getWorld(): World;

  /**
   * Obtém a configuração atual do jogo
   */
  getConfig(): GameConfig;
}
