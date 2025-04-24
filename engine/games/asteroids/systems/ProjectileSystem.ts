import { System } from "@/engine/core/ecs/base/System";
import { Entity } from "@/engine/core/ecs/base/Entity";
import { World } from "@/engine/core/ecs/base/World";
import { TransformComponent } from "@/engine/core/ecs/components/TransformComponent";
import { RenderComponent } from "@/engine/core/ecs/components/RenderComponent";
import { PhysicsComponent } from "@/engine/core/ecs/components/PhysicsComponent";
import { ColliderComponent } from "@/engine/core/ecs/components/ColliderComponent";
import { ProjectileComponent } from "@/engine/games/asteroids/components/ProjectileComponent";
import {
  PLAYER_EVENTS,
  PROJECTILE_EVENTS,
} from "@/engine/core/messaging/MessageTypes";
import { MessageData } from "@/engine/core/messaging/MessageBus";

interface FireData extends MessageData {
  position: { x: number; y: number };
  rotation: number;
  velocity?: { x: number; y: number };
  sourceEntity: Entity;
}

export class ProjectileSystem extends System {
  readonly componentTypes = [
    TransformComponent.TYPE,
    PhysicsComponent.TYPE,
    ProjectileComponent.TYPE,
  ];

  priority = 20;

  private static readonly CONFIG = {
    SPEED: 7,
    LIFESPAN: 1.5,
    SIZE: 3,
    OFFSET_DISTANCE: 20,
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

  private registerEventListeners(): void {
    if (!this.world) return;

    this.world.on(PLAYER_EVENTS.FIRE, (data: MessageData) => {
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

    const expired = projectile.update(deltaTime);

    if (expired && this.world) {
      entity.emit(PROJECTILE_EVENTS.EXPIRE, { entity });

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

    const initialPosition = this.calculateProjectilePosition(
      position,
      rotation
    );
    const projectileVelocity = this.calculateProjectileVelocity(
      rotation,
      shipVelocity
    );

    const projectile = this.createProjectileEntity(
      initialPosition,
      rotation,
      projectileVelocity,
      sourceEntity
    );

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

    const projectileVelocityX = -Math.sin(rotation) * SPEED;
    const projectileVelocityY = Math.cos(rotation) * SPEED;

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

    const projectile = new Entity();

    const transform = new TransformComponent(position.x, position.y, rotation);

    const physics = new PhysicsComponent(1.0, true, 0.1);
    physics.setVelocity(velocity.x, velocity.y);
    physics.angularVelocity = 0;

    const render = RenderComponent.createRectangle(SIZE, SIZE);
    render.setColor(1, 1, 1, 1);

    const collider = ColliderComponent.createCircle(SIZE);
    collider.setTrigger(true);

    const projectileComponent = new ProjectileComponent(
      LIFESPAN,
      1,
      sourceEntity
    );

    projectile
      .addComponent(transform)
      .addComponent(physics)
      .addComponent(render)
      .addComponent(collider)
      .addComponent(projectileComponent);

    return projectile;
  }
}
