import { System } from "@/engine/core/ecs/base/System";
import { Entity } from "@/engine/core/ecs/base/Entity";
import { World } from "@/engine/core/ecs/base/World";
import { TransformComponent } from "@/engine/core/ecs/components/TransformComponent";
import { RenderComponent } from "@/engine/core/ecs/components/RenderComponent";
import { PhysicsComponent } from "@/engine/core/ecs/components/PhysicsComponent";
import { ColliderComponent } from "@/engine/core/ecs/components/ColliderComponent";
import { ProjectileComponent } from "@/engine/games/floatingAround/components/ProjectileComponent";
import {
  PLAYER_EVENTS,
  PROJECTILE_EVENTS,
} from "@/engine/core/messaging/MessageTypes";
import { MessageData } from "@/engine/core/messaging/MessageBus";

/**
 * Interface para dados de tiro que estende MessageData
 */
interface FireData extends MessageData {
  position: { x: number; y: number };
  rotation: number;
  velocity?: { x: number; y: number };
  sourceEntity: Entity;
}

/**
 * Sistema que gerencia o ciclo de vida dos projéteis
 */
export class ProjectileSystem extends System {
  /** Define quais componentes uma entidade deve ter para ser processada */
  readonly componentTypes = [
    TransformComponent.TYPE,
    PhysicsComponent.TYPE,
    ProjectileComponent.TYPE,
  ];

  /** Prioridade de execução */
  priority = 20;

  // Configurações dos projéteis
  private static readonly CONFIG = {
    SPEED: 7,
    LIFESPAN: 1.5, // em frames
    SIZE: 3,
    OFFSET_DISTANCE: 20, // distância da ponta da nave
  };

  /**
   * Construtor
   * @param world Referência ao mundo
   */
  constructor(world: World) {
    super();
    this.world = world;
    this.registerEventListeners();
  }

  /**
   * Registra os event listeners necessários
   */
  private registerEventListeners(): void {
    if (!this.world) return;

    // Usar o tipo MessageData para o parâmetro para manter compatibilidade
    this.world.on(PLAYER_EVENTS.FIRE, (data: MessageData) => {
      // Fazer uma verificação de tipo antes de tratar como FireData
      this.createProjectile(data as FireData);
    });
  }

  /**
   * Atualiza os projéteis existentes
   * @param entities Lista de entidades de projéteis
   */
  update(entities: Entity[], deltaTime: number): void {
    entities.forEach((entity) => this.updateProjectile(entity, deltaTime));
  }

  /**
   * Atualiza um projétil individual
   * @param entity Entidade do projétil
   */
  private updateProjectile(entity: Entity, deltaTime: number): void {
    const projectile = entity.getComponent<ProjectileComponent>(
      ProjectileComponent.TYPE
    );

    if (!projectile) return;

    // Atualiza o componente do projétil
    const expired = projectile.update(deltaTime);

    // Remove o projétil se expirou
    if (expired && this.world) {
      // Emite evento de expiração
      entity.emit(PROJECTILE_EVENTS.EXPIRE, { entity });

      // Remove a entidade do mundo
      this.world.removeEntity(entity.id);
    }
  }

  /**
   * Cria um novo projétil
   * @param data Dados do tiro (posição, rotação, etc)
   */
  private createProjectile(data: FireData): void {
    if (!this.world) return;

    const { position, rotation, velocity: shipVelocity, sourceEntity } = data;

    // Calcula a posição e velocidade iniciais
    const initialPosition = this.calculateProjectilePosition(
      position,
      rotation
    );
    const projectileVelocity = this.calculateProjectileVelocity(
      rotation,
      shipVelocity
    );

    // Cria a entidade do projétil com todos os componentes
    const projectile = this.createProjectileEntity(
      initialPosition,
      rotation,
      projectileVelocity,
      sourceEntity
    );

    // Adiciona a entidade ao mundo
    this.world.addEntity(projectile);
  }

  /**
   * Calcula a posição inicial do projétil
   */
  private calculateProjectilePosition(
    position: { x: number; y: number },
    rotation: number
  ): { x: number; y: number } {
    const { OFFSET_DISTANCE } = ProjectileSystem.CONFIG;

    const offsetX = -Math.sin(rotation) * OFFSET_DISTANCE;
    const offsetY = Math.cos(rotation) * OFFSET_DISTANCE;

    return {
      x: position.x + offsetX,
      y: position.y + offsetY,
    };
  }

  /**
   * Calcula a velocidade do projétil
   */
  private calculateProjectileVelocity(
    rotation: number,
    shipVelocity?: { x: number; y: number }
  ): { x: number; y: number } {
    const { SPEED } = ProjectileSystem.CONFIG;

    // Componente de velocidade do projétil
    const projectileVelocityX = -Math.sin(rotation) * SPEED;
    const projectileVelocityY = Math.cos(rotation) * SPEED;

    // Adiciona a velocidade da nave à velocidade do projétil
    return {
      x: projectileVelocityX + (shipVelocity?.x || 0),
      y: projectileVelocityY + (shipVelocity?.y || 0),
    };
  }

  /**
   * Cria uma entidade de projétil com todos os componentes necessários
   */
  private createProjectileEntity(
    position: { x: number; y: number },
    rotation: number,
    velocity: { x: number; y: number },
    sourceEntity: Entity
  ): Entity {
    const { SIZE, LIFESPAN } = ProjectileSystem.CONFIG;

    // Cria a entidade do projétil
    const projectile = new Entity();

    // Componente de transformação
    const transform = new TransformComponent(position.x, position.y, rotation);

    // Componente de física
    const physics = new PhysicsComponent(1.0, true, 0.1);
    physics.setVelocity(velocity.x, velocity.y);
    physics.angularVelocity = 0;

    // Componente de renderização - pequeno ponto branco
    const render = RenderComponent.createRectangle(SIZE, SIZE);
    render.setColor(1, 1, 1, 1);

    // Componente de colisor
    const collider = ColliderComponent.createCircle(SIZE);
    collider.setTrigger(true); // Projéteis não colidem fisicamente

    // Componente de projétil
    const projectileComponent = new ProjectileComponent(
      LIFESPAN,
      1,
      sourceEntity
    );

    // Adiciona todos os componentes
    projectile
      .addComponent(transform)
      .addComponent(physics)
      .addComponent(render)
      .addComponent(collider)
      .addComponent(projectileComponent);

    return projectile;
  }
}
