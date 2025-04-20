import { System } from "@/engine/core/ecs/base/System";
import { PhysicsComponent } from "@/engine/core/ecs/components/PhysicsComponent";
import { TransformComponent } from "@/engine/core/ecs/components/TransformComponent";
import { FloatingAroundGame } from "../FloatingAroundGame";
import { Entity } from "@/engine/core/ecs/base/Entity";

/**
 * Sistema para controle da nave com teclado
 */
export class ShipControlSystem extends System {
  readonly componentTypes = [TransformComponent.TYPE, PhysicsComponent.TYPE];
  private game: FloatingAroundGame;

  constructor(game: FloatingAroundGame) {
    super();
    this.game = game;
  }

  update(entities: Entity[], _deltaTime: number): void {
    const keyState = this.game.getKeyState();
    const config = this.game.getConfig();

    // Processa as entidades com os componentes necessários
    for (const entity of entities) {
      const transform = entity.getComponent<TransformComponent>(
        TransformComponent.TYPE
      );
      const physics = entity.getComponent<PhysicsComponent>(
        PhysicsComponent.TYPE
      );

      if (!transform || !physics) continue;

      // Rotação da nave
      if (keyState.ArrowLeft) {
        transform.rotation -= config.rotationSpeed;
      }
      if (keyState.ArrowRight) {
        transform.rotation += config.rotationSpeed;
      }

      // Aceleração da nave
      if (keyState.ArrowUp) {
        const thrustX = -Math.sin(transform.rotation) * config.thrustForce;
        const thrustY = Math.cos(transform.rotation) * config.thrustForce;
        physics.velocity.x += thrustX;
        physics.velocity.y += thrustY;
      }
    }
  }
}
