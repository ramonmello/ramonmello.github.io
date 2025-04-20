import { BaseGame } from "@/engine/games/base/BaseGame";
import { GameConfig } from "@/engine/games/base/Game";
import { World } from "@/engine/core/ecs/base/World";
import { PhysicsSystem } from "@/engine/core/ecs/systems/PhysicsSystem";
import { RenderSystem } from "@/engine/core/ecs/systems/RenderSystem";
import { Entity } from "@/engine/core/ecs/base/Entity";
import { TransformComponent } from "@/engine/core/ecs/components/TransformComponent";
import { RenderComponent } from "@/engine/core/ecs/components/RenderComponent";
import { PhysicsComponent } from "@/engine/core/ecs/components/PhysicsComponent";
import { getWebGLContext } from "@/engine/core/rendering/WebGLContext";
import { KeyState } from "@/hooks/useKeyboard";
import { ShipControlSystem } from "./systems/ShipControlSystem";

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

  /** Estado atual das teclas */
  private keyState: KeyState = {};

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
   * Atualiza o estado das teclas
   */
  updateKeyState(keyState: KeyState): void {
    this.keyState = keyState;
  }

  /**
   * Obtém o estado atual das teclas
   */
  getKeyState(): KeyState {
    return this.keyState;
  }

  /**
   * Cria os sistemas necessários para o jogo
   */
  protected createSystems(): void {
    // Sistemas básicos necessários
    this.world.addSystem(new PhysicsSystem());
    this.world.addSystem(new RenderSystem(true, [0, 0, 0.1, 0])); // Fundo transparente

    // Sistema específico para controlar a nave com input do teclado
    this.world.addSystem(new ShipControlSystem(this));
  }

  /**
   * Cria as entidades iniciais do jogo
   */
  protected createEntities(): void {
    // Cria a nave
    this.shipEntity = this.createShipEntity();
    this.world.addEntity(this.shipEntity);
  }

  /**
   * Cria a entidade da nave
   */
  private createShipEntity(): Entity {
    const { canvas } = getWebGLContext();

    // Cria a entidade com ID e nome
    const ship = new Entity("player_ship", "Player Ship");

    // Componente de transformação - posiciona no centro da tela
    const transform = new TransformComponent(
      canvas.width / 2,
      canvas.height / 2,
      0 // Apontando para cima
    );

    // Vertices para a forma da nave (triângulo)
    // Dimensões: base = 15, altura = 37.5
    const shipVertices = new Float32Array([0, 22.5, -7.5, -15, 7.5, -15]);

    // Componente de renderização
    const render = new RenderComponent(shipVertices);
    render.setColor(1, 1, 1, 1); // Branco

    // Componente de física
    const physics = new PhysicsComponent(0.98, true, 0.5, 5);

    // Adiciona todos os componentes à entidade
    ship.addComponent(transform).addComponent(render).addComponent(physics);

    return ship;
  }

  /**
   * Obtém a entidade da nave
   */
  getShipEntity(): Entity | undefined {
    return this.shipEntity;
  }
}
