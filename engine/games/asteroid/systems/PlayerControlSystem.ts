import { System } from "../../../core/ecs/System";
import { Entity } from "../../../core/ecs/Entity";
import { TransformComponent } from "../../../core/ecs/components/TransformComponent";
import { PhysicsComponent } from "../../../core/ecs/components/PhysicsComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { PLAYER_EVENTS } from "../../../core/ecs/MessageTypes";
import { AsteroidGame } from "../AsteroidGame";

/**
 * Sistema que controla a nave do jogador com base nas entradas do usuário
 */
export class PlayerControlSystem extends System {
  /** Define quais componentes uma entidade deve ter para ser processada */
  readonly componentTypes = [
    TransformComponent.TYPE,
    PhysicsComponent.TYPE,
    PlayerComponent.TYPE,
  ];

  /** Prioridade de execução (início da cadeia) */
  priority = 1;

  /** Referência ao jogo Asteroid */
  private game?: AsteroidGame;

  /**
   * Construtor
   * @param game Instância do jogo Asteroid
   */
  constructor(game?: AsteroidGame) {
    super();
    this.game = game;
  }

  /**
   * Atualiza as entidades de jogador com base na entrada do usuário
   * @param entities Lista de entidades de jogador
   * @param deltaTime Tempo desde a última atualização
   */
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
      const player = entity.getComponent<PlayerComponent>(PlayerComponent.TYPE);

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
