import { System } from "@/engine/core/ecs/base/System";
import { PhysicsComponent } from "@/engine/core/ecs/components/PhysicsComponent";
import { TransformComponent } from "@/engine/core/ecs/components/TransformComponent";
import { ShipComponent } from "../components/ShipComponent";
import { FloatingAroundGame } from "../FloatingAroundGame";
import { Entity } from "@/engine/core/ecs/base/Entity";
import { PLAYER_EVENTS } from "@/engine/core/messaging/MessageTypes";

/**
 * Sistema para controle da nave com teclado
 */
export class ShipControlSystem extends System {
  readonly componentTypes = [
    TransformComponent.TYPE,
    PhysicsComponent.TYPE,
    ShipComponent.TYPE,
  ];

  priority = 1;

  private game: FloatingAroundGame;

  constructor(game: FloatingAroundGame) {
    super();
    this.game = game;
  }

  update(entities: Entity[], deltaTime: number): void {
    // Normaliza o delta de tempo para suavizar o movimento
    const timeScale = deltaTime / 16.667;

    // Obtém o sistema de entrada do jogo ou do mundo
    const inputSystem = this.game?.getInputSystem();
    if (!inputSystem) return;

    // Processa cada entidade de jogador
    entities.forEach((entity) => {
      const transform = entity.getComponent<TransformComponent>(
        TransformComponent.TYPE
      );
      const physics = entity.getComponent<PhysicsComponent>(
        PhysicsComponent.TYPE
      );
      const player = entity.getComponent<ShipComponent>(ShipComponent.TYPE);

      if (!transform || !physics || !player) return;

      // Atualiza o componente do jogador
      player.update(deltaTime);

      // Obtém o estado da entrada
      const direction = inputSystem.getDirection();
      const actions = inputSystem.getActions();

      // Rotação
      if (direction.x !== 0) {
        const rotationAmount = player.rotationSpeed * direction.x * timeScale;
        transform.rotate(rotationAmount);
      }

      // Aceleração (thrusting)
      if (direction.y < 0) {
        // Y negativo = para cima = acelerar
        player.thrusting = true;

        // Calcula vetor de aceleração com base na rotação
        const thrustX =
          -Math.sin(transform.rotation) * player.thrustPower * timeScale;
        const thrustY =
          Math.cos(transform.rotation) * player.thrustPower * timeScale;

        // Aplica aceleração
        physics.applyForce(thrustX, thrustY);

        // Atualiza o rastro
        player.updateTrail(transform.position, transform.rotation);
      } else {
        player.thrusting = false;
      }

      // Atirar
      if (actions.fire && player.canShoot()) {
        player.shoot();

        // Emite evento de tiro para criar o projétil
        entity.emit(PLAYER_EVENTS.FIRE, {
          position: { ...transform.position },
          rotation: transform.rotation,
          velocity: { ...physics.velocity },
        });
      }
    });
  }
}
