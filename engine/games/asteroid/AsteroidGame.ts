import { BaseGame } from "@/engine/games/base/BaseGame";
import { GameConfig } from "@/engine/games/base/Game";
import { World } from "@/engine/core/ecs/base/World";
import { PhysicsSystem } from "@/engine/core/ecs/systems/PhysicsSystem";
import { RenderSystem } from "@/engine/core/ecs/systems/RenderSystem";
import { CollisionSystem } from "@/engine/core/ecs/systems/CollisionSystem";
import {
  COLLISION_EVENTS,
  PLAYER_EVENTS,
  GAME_EVENTS,
  PROJECTILE_EVENTS,
} from "@/engine/core/messaging/MessageTypes";
import { Entity } from "@/engine/core/ecs/base/Entity";
import { PlayerControlSystem } from "./systems/PlayerControlSystem";
import { ProjectileSystem } from "./systems/ProjectileSystem";
import { createShipEntity } from "./entities/ShipEntity";
import { createAsteroidEntity } from "./entities/AsteroidEntity";
import {
  AsteroidComponent,
  AsteroidSize,
} from "./components/AsteroidComponent";
import { ColliderComponent } from "@/engine/core/ecs/components/ColliderComponent";
import { PlayerComponent } from "./components/PlayerComponent";
import { TransformComponent } from "@/engine/core/ecs/components/TransformComponent";
import { MessageData } from "@/engine/core/messaging/MessageBus";
import { ProjectileComponent } from "./components/ProjectileComponent";

// Interfaces para tipagem de eventos
interface ProjectileHitEventData extends MessageData {
  asteroid: Entity;
  projectile: Entity;
}

interface CollisionEventData extends MessageData {
  entityA: Entity;
  entityB: Entity;
  colliderA: ColliderComponent;
  colliderB: ColliderComponent;
}

/**
 * Configuração específica para o jogo Asteroid
 */
export interface AsteroidGameConfig extends GameConfig {
  /** Número inicial de asteroides */
  asteroidCount: number;

  /** Número de vidas do jogador */
  playerLives: number;

  /** Nível inicial */
  initialLevel: number;

  /** Pontuação para ganhar uma vida extra */
  extraLifeScore: number;
}

/**
 * Implementação do jogo Asteroid usando a arquitetura ECS
 */
export class AsteroidGame extends BaseGame {
  /** Nome do jogo */
  name = "Asteroid";

  /** Descrição do jogo */
  description = "Remake do clássico jogo Asteroid da Atari (1979)";

  /** Referência para a entidade do jogador */
  private playerEntity?: Entity;

  /** Pontuação atual */
  private score: number = 0;

  /** Vidas restantes */
  private lives: number = 3;

  /** Nível atual */
  private level: number = 1;

  /** Pontuação na última vida extra */
  private lastExtraLifeScore: number = 0;

  /** Estado do jogo */
  private gameState: "ready" | "playing" | "gameOver" = "ready";

  /** Sistema de projéteis */
  private projectileSystem?: ProjectileSystem;

  /**
   * Retorna a configuração padrão para o jogo Asteroid
   */
  protected getDefaultConfig(): AsteroidGameConfig {
    return {
      canvasWidth: 800,
      canvasHeight: 600,
      debug: false,
      asteroidCount: 4,
      playerLives: 3,
      initialLevel: 1,
      extraLifeScore: 10000,
    };
  }

  /**
   * Obtém a configuração específica para o jogo Asteroid
   */
  getConfig(): AsteroidGameConfig {
    return this.config as AsteroidGameConfig;
  }

  /**
   * Inicializa o jogo
   */
  async initialize(world?: World, config?: Partial<GameConfig>): Promise<void> {
    await super.initialize(world, config);

    // Inicializa propriedades do jogo
    const gameConfig = this.getConfig();
    this.lives = gameConfig.playerLives;
    this.level = gameConfig.initialLevel;
    this.score = 0;
    this.lastExtraLifeScore = 0;
    this.gameState = "ready";

    // Configura ouvintes de eventos
    this.setupEventListeners();
  }

  /**
   * Cria os sistemas necessários para o jogo
   */
  protected createSystems(): void {
    // Sistemas da engine core
    this.world.addSystem(new PhysicsSystem());
    this.world.addSystem(new CollisionSystem());
    this.world.addSystem(new RenderSystem(true, [0, 0, 0.1, 0])); // Fundo transparente

    // Sistemas específicos do jogo Asteroid
    this.world.addSystem(new PlayerControlSystem(this));
    this.projectileSystem = new ProjectileSystem(this.world);
    this.world.addSystem(this.projectileSystem);
  }

  /**
   * Cria as entidades iniciais do jogo
   */
  protected createEntities(): void {
    // Cria o jogador (nave)
    this.createPlayer();

    // Cria asteroides iniciais
    this.createAsteroids();
  }

  /**
   * Configura os listeners de eventos
   */
  private setupEventListeners(): void {
    // Detecção de colisões
    this.world.on(COLLISION_EVENTS.DETECT, (data: MessageData) => {
      const collisionData = data as CollisionEventData;
      this.handleCollision(collisionData);
    });

    // Eventos do jogador
    this.world.on(PLAYER_EVENTS.DIE, () => {
      this.handlePlayerDeath();
    });

    // Eventos de jogo
    this.world.on(GAME_EVENTS.STARTED, () => {
      this.gameState = "playing";
    });

    // Eventos de projéteis
    this.world.on(PROJECTILE_EVENTS.HIT, (data: MessageData) => {
      const projectileData = data as ProjectileHitEventData;
      const { asteroid, projectile } = projectileData;

      if (asteroid && this.isEntityValid(asteroid)) {
        const asteroidComponent = asteroid.getComponent(
          AsteroidComponent.TYPE
        ) as AsteroidComponent | undefined;

        if (asteroidComponent) {
          // Adiciona pontuação
          this.addScore(asteroidComponent.points);

          // Inicia animação de destruição
          asteroidComponent.startDestroyAnimation(10);

          // Cria fragmentos
          this.createAsteroidFragments(asteroid);

          // Remove o asteroide
          this.world.removeEntity(asteroid.id);
        }
      }

      // Remove o projétil
      if (projectile && this.isEntityValid(projectile)) {
        this.world.removeEntity(projectile.id);
      }

      // Verifica se todos os asteroides foram destruídos
      this.checkLevelComplete();
    });
  }

  /**
   * Utilitário para verificar se uma entidade é válida
   * @param entity Entidade a ser verificada
   * @returns true se a entidade é válida
   */
  private isEntityValid(entity: Entity): boolean {
    return (
      !!entity && !!entity.id && this.world.getEntity(entity.id) === entity
    );
  }

  /**
   * Cria a nave do jogador
   */
  private createPlayer(): void {
    this.playerEntity = createShipEntity(this.getConfig());
    this.world.addEntity(this.playerEntity);
  }

  /**
   * Cria os asteroides iniciais
   */
  private createAsteroids(): void {
    const { asteroidCount } = this.getConfig();

    for (let i = 0; i < asteroidCount; i++) {
      const asteroid = createAsteroidEntity("large");
      this.world.addEntity(asteroid);
    }
  }

  /**
   * Cria fragmentos de um asteroide destruído
   */
  private createAsteroidFragments(asteroid: Entity): void {
    const asteroidComponent = asteroid.getComponent(AsteroidComponent.TYPE) as
      | AsteroidComponent
      | undefined;

    if (!asteroidComponent) return;

    // Só cria fragmentos se não for o menor tamanho
    if (asteroidComponent.size === AsteroidSize.Small) return;

    const fragmentCount = asteroidComponent.getFragmentCount();
    const fragmentSize = asteroidComponent.getFragmentSize();

    // Obtém a posição do asteroide original
    const transform = asteroid.getComponent(TransformComponent.TYPE) as
      | TransformComponent
      | undefined;

    if (!transform || !transform.position) return;
    const position = transform.position;

    // Cria os fragmentos
    for (let i = 0; i < fragmentCount; i++) {
      const fragment = createAsteroidEntity(fragmentSize, {
        x: position.x,
        y: position.y,
      });

      this.world.addEntity(fragment);
    }
  }

  /**
   * Lida com colisões entre entidades
   */
  private handlePlayerDeath(): void {
    this.lives--;

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.respawnPlayer();
    }
  }

  /**
   * Recria o jogador após perder uma vida
   */
  private respawnPlayer(): void {
    // Lógica para respawn com invencibilidade temporária
  }

  /**
   * Processa o fim de jogo
   */
  private gameOver(): void {
    this.gameState = "gameOver";

    // Emite evento de game over para o world
    this.world.emit("gameOver", {
      score: this.score,
      level: this.level,
    });

    // Pausa o jogo quando ocorre game over
    this.pause();
  }

  /**
   * Incrementa a pontuação
   */
  private addScore(points: number): void {
    this.score += points;
    this.world.emit(GAME_EVENTS.SCORE_CHANGED, { score: this.score });

    // Verifica se ganhou vida extra
    const { extraLifeScore } = this.getConfig();
    if (
      Math.floor(this.score / extraLifeScore) >
      Math.floor(this.lastExtraLifeScore / extraLifeScore)
    ) {
      this.lives++;
      this.lastExtraLifeScore = this.score;
      // Emitir som/efeito de vida extra
    }
  }

  /**
   * Avança para o próximo nível
   */
  private nextLevel(): void {
    this.level++;
    this.world.emit(GAME_EVENTS.LEVEL_CHANGED, { level: this.level });

    // Cria mais asteroides no novo nível
    const asteroidCount =
      this.getConfig().asteroidCount + Math.min(this.level - 1, 6);
    for (let i = 0; i < asteroidCount; i++) {
      // this.world.addEntity(createAsteroidEntity('large'));
    }
  }

  /**
   * Verifica se todos os asteroides foram destruídos para passar de nível
   */
  private checkLevelComplete(): void {
    // Conta quantos asteroides ainda existem no mundo
    const asteroids = this.world.getEntitiesWith(AsteroidComponent.TYPE);

    // Se não houver mais asteroides, avança para o próximo nível
    if (asteroids.length === 0) {
      this.nextLevel();
    }
  }

  /**
   * Reinicia o jogo
   */
  async restart(): Promise<void> {
    await super.restart();
    this.gameState = "playing";
  }

  // Métodos públicos para acesso ao estado do jogo

  /**
   * Retorna a pontuação atual
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Retorna o número de vidas restantes
   */
  getLives(): number {
    return this.lives;
  }

  /**
   * Retorna o nível atual
   */
  getLevel(): number {
    return this.level;
  }

  /**
   * Retorna o estado atual do jogo
   */
  getGameState(): "ready" | "playing" | "gameOver" {
    return this.gameState;
  }

  /**
   * Lida com eventos de colisão entre entidades
   * @param data Dados da colisão contendo as entidades envolvidas
   */
  private handleCollision(data: CollisionEventData): void {
    const { entityA, entityB } = data;

    // Ignora colisões se o jogo não estiver rodando
    if (this.gameState !== "playing") return;

    // Verifica colisão entre nave e asteroide
    const isPlayerA = entityA.hasComponent(PlayerComponent.TYPE);
    const isPlayerB = entityB.hasComponent(PlayerComponent.TYPE);
    const isAsteroidA = entityA.hasComponent(AsteroidComponent.TYPE);
    const isAsteroidB = entityB.hasComponent(AsteroidComponent.TYPE);
    const isProjectileA = entityA.hasComponent(ProjectileComponent.TYPE);
    const isProjectileB = entityB.hasComponent(ProjectileComponent.TYPE);

    // Caso seja colisão entre nave e asteroide
    if ((isPlayerA && isAsteroidB) || (isPlayerB && isAsteroidA)) {
      const player = isPlayerA ? entityA : entityB;
      const asteroid = isPlayerA ? entityB : entityA;

      // Verifica se a nave está invencível
      const playerComponent = player.getComponent(PlayerComponent.TYPE) as
        | PlayerComponent
        | undefined;

      if (playerComponent && !playerComponent.invincible) {
        // Emite o evento de morte do jogador
        this.world.emit(PLAYER_EVENTS.DIE, { player });

        // Uso da variável asteroid para evitar o erro
        console.log(`Colisão com asteroide ID: ${asteroid.id}`);
      }
    }

    // Caso seja colisão entre projétil e asteroide
    if ((isProjectileA && isAsteroidB) || (isProjectileB && isAsteroidA)) {
      const projectile = isProjectileA ? entityA : entityB;
      const asteroid = isProjectileA ? entityB : entityA;

      // Emite o evento de acerto do projétil no asteroide
      this.world.emit(PROJECTILE_EVENTS.HIT, {
        projectile,
        asteroid,
      });
    }

    // Verificações adicionais para outros tipos de colisão podem ser
    // implementadas conforme necessário
  }
}
