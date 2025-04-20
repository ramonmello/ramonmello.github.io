import { System } from "../../../core/ecs/System";
import { Entity } from "../../../core/ecs/Entity";
import { World } from "../../../core/ecs/World";
import { TransformComponent } from "../../../core/ecs/components/TransformComponent";
import { RenderComponent } from "../../../core/ecs/components/RenderComponent";
import { PhysicsComponent } from "../../../core/ecs/components/PhysicsComponent";
import { ColliderComponent } from "../../../core/ecs/components/ColliderComponent";
import { ProjectileComponent } from "../components/ProjectileComponent";
import {
  PLAYER_EVENTS,
  PROJECTILE_EVENTS,
} from "../../../core/ecs/MessageTypes";

/**
 * Sistema que gerencia o ciclo de vida dos projéteis e cria novos projéteis
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

  /** Velocidade dos projéteis */
  private readonly projectileSpeed: number = 7;

  /** Duração dos projéteis em frames */
  private readonly projectileLifespan: number = 60;

  /**
   * Construtor
   * @param world Referência ao mundo
   */
  constructor(world: World) {
    super();
    this.world = world;

    // Escuta eventos de tiro para criar novos projéteis
    this.world.on(PLAYER_EVENTS.FIRE, (data) => {
      this.createProjectile(data);
    });
  }

  /**
   * Atualiza os projéteis existentes
   * @param entities Lista de entidades de projéteis
   */
  update(entities: Entity[]): void {
    entities.forEach((entity) => {
      const projectile = entity.getComponent<ProjectileComponent>(
        ProjectileComponent.TYPE
      );

      if (!projectile) return;

      // Atualiza o componente do projétil
      const expired = projectile.update();

      // Remove o projétil se expirou
      if (expired) {
        // Emite evento de expiração
        entity.emit(PROJECTILE_EVENTS.EXPIRE, { entity });

        // Remove a entidade do mundo
        this.world?.removeEntity(entity);
      }
    });
  }

  /**
   * Cria um novo projétil
   * @param data Dados do tiro (posição, rotação, etc)
   */
  private createProjectile(data: any): void {
    if (!this.world) return;

    const { position, rotation, velocity: shipVelocity } = data;

    // Calcula a posição inicial (ponta da nave)
    const offsetDistance = 20; // Distância da ponta da nave
    const offsetX = -Math.sin(rotation) * offsetDistance;
    const offsetY = Math.cos(rotation) * offsetDistance;

    const initialPosition = {
      x: position.x + offsetX,
      y: position.y + offsetY,
    };

    // Calcula a velocidade do projétil
    const projectileVelocityX = -Math.sin(rotation) * this.projectileSpeed;
    const projectileVelocityY = Math.cos(rotation) * this.projectileSpeed;

    // Adiciona a velocidade da nave à velocidade do projétil
    const finalVelocityX = projectileVelocityX + (shipVelocity?.x || 0);
    const finalVelocityY = projectileVelocityY + (shipVelocity?.y || 0);

    // Cria a entidade do projétil
    const projectile = new Entity("projectile");

    // Componente de transformação
    const transform = new TransformComponent(
      initialPosition.x,
      initialPosition.y,
      rotation
    );

    // Componente de física
    const physics = new PhysicsComponent(1.0, true, 0.1);
    physics.setVelocity(finalVelocityX, finalVelocityY);
    physics.angularVelocity = 0;

    // Componente de renderização - pequeno ponto branco
    const render = RenderComponent.createRectangle(2, 2);
    render.setColor(1, 1, 1, 1);

    // Componente de colisor
    const collider = ColliderComponent.createCircle(2);
    collider.setTrigger(true); // Projéteis não colidem fisicamente

    // Componente de projétil
    const projectileComponent = new ProjectileComponent(
      this.projectileLifespan,
      1,
      data.sourceEntity
    );

    // Adiciona todos os componentes
    projectile
      .addComponent(transform)
      .addComponent(physics)
      .addComponent(render)
      .addComponent(collider)
      .addComponent(projectileComponent);

    // Adiciona a entidade ao mundo
    this.world.addEntity(projectile);
  }
}
