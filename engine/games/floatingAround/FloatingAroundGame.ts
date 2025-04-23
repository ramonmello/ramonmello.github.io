import { BaseGame } from "@/engine/games/base/BaseGame";
import { GameConfig } from "@/engine/games/base/Game";
import { World } from "@/engine/core/ecs/base/World";
import { PhysicsSystem } from "@/engine/core/ecs/systems/PhysicsSystem";
import { RenderSystem } from "@/engine/core/ecs/systems/RenderSystem";
import { Entity } from "@/engine/core/ecs/base/Entity";
import { ShipControlSystem } from "./systems/ShipControlSystem";
import { createShipEntity } from "./entities/ShipEntity";
import { ProjectileSystem } from "./systems/ProjectileSystem";

/**
 * Configuração específica para o jogo FloatingAround
 */
export interface FloatingAroundGameConfig extends GameConfig {
  /** Velocidade de rotação da nave */
  rotationSpeed: number;

  /** Força de aceleração da nave */
  thrustForce: number;
}

/**
 * Implementação do jogo FloatingAround - apenas navegação com a nave
 */
export class FloatingAroundGame extends BaseGame {
  /** Nome do jogo */
  name = "FloatingAround";

  /** Descrição do jogo */
  description = "Apenas flutue pelo espaço controlando uma nave";

  /** Referência para a entidade da nave */
  private shipEntity?: Entity;

  /**
   * Retorna a configuração padrão para o jogo FloatingAround
   */
  protected getDefaultConfig(): FloatingAroundGameConfig {
    return {
      canvasWidth: 800,
      canvasHeight: 600,
      debug: false,
      rotationSpeed: 0.05,
      thrustForce: 0.1,
    };
  }

  /**
   * Obtém a configuração específica para o jogo FloatingAround
   */
  getConfig(): FloatingAroundGameConfig {
    return this.config as FloatingAroundGameConfig;
  }

  /**
   * Inicializa o jogo
   */
  async initialize(world?: World, config?: Partial<GameConfig>): Promise<void> {
    await super.initialize(world, config);
  }

  /**
   * Cria os sistemas necessários para o jogo
   */
  protected createSystems(): void {
    // Sistemas básicos necessários
    this.world.addSystem(new PhysicsSystem());
    this.world.addSystem(new RenderSystem(true, [0, 0, 0.1, 0])); // Fundo transparente

    // Sistema específico para o game
    this.world.addSystem(new ShipControlSystem(this));
    this.world.addSystem(new ProjectileSystem(this.world));
  }

  /**
   * Cria a entidade da nave
   */
  private createShip(): void {
    this.shipEntity = createShipEntity(this.getConfig());
    this.world.addEntity(this.shipEntity);
  }

  protected createEntities(): void {
    this.createShip();
  }
}
