import { System } from "@/engine/core/ecs/base/System";
import { Entity } from "@/engine/core/ecs/base/Entity";
import { TransformComponent } from "@/engine/core/ecs/components/TransformComponent";
import { PhysicsComponent } from "@/engine/core/ecs/components/PhysicsComponent";
import { getWebGLContext } from "@/engine/core/rendering/WebGLContext";
import { TARGET_FPS } from "@/engine/core/config/time";

/**
 * Sistema que atualiza propriedades físicas das entidades:
 * velocidade, aceleração, posição, etc.
 */
export class PhysicsSystem extends System {
  /** Define quais componentes uma entidade deve ter para ser processada */
  readonly componentTypes = [TransformComponent.TYPE, PhysicsComponent.TYPE];

  /** Prioridade de execução (menor = executa primeiro) */
  priority = 10;

  /**
   * Atualiza a física de todas as entidades elegíveis
   * @param entities Lista de entidades que possuem TransformComponent e PhysicsComponent
   * @param deltaTime Tempo desde a última atualização em segundos
   */
  update(entities: Entity[], deltaTime: number): void {
    // Normalize deltaTime para que o movimento seja independente da taxa de quadros
    // Multiplicando pela taxa de quadros de referência
    const timeScale = deltaTime * TARGET_FPS;

    // Obter dimensões do canvas uma vez para não repetir a chamada
    const { canvas } = getWebGLContext();
    const width = canvas.width;
    const height = canvas.height;

    entities.forEach((entity) => {
      const transform = entity.getComponent<TransformComponent>(
        TransformComponent.TYPE
      );
      const physics = entity.getComponent<PhysicsComponent>(
        PhysicsComponent.TYPE
      );

      if (!transform || !physics) return; // Validação adicional

      // Atualiza velocidade baseado na aceleração
      physics.velocity.x += physics.acceleration.x * timeScale;
      physics.velocity.y += physics.acceleration.y * timeScale;

      // Aplica fricção
      physics.velocity.x *= Math.pow(physics.friction, timeScale);
      physics.velocity.y *= Math.pow(physics.friction, timeScale);

      // -----------------------------------------------------------------
      //  NOVO BLOCO: garante que a velocidade não passe de maxSpeed
      // -----------------------------------------------------------------
      // O que ele faz?
      // Calcula a velocidade atual (speed) usando Pitágoras (√(vx² + vy²)).
      // Se essa velocidade for maior que maxSpeed, multiplica vx e vy por um fator de escala que
      // reduz o módulo do vetor exatamente até o limite.

      if (physics.maxSpeed !== undefined) {
        const speed = Math.hypot(physics.velocity.x, physics.velocity.y);
        if (speed > physics.maxSpeed) {
          const factor = physics.maxSpeed / speed;
          physics.velocity.x *= factor;
          physics.velocity.y *= factor;
        }
      }

      // Zera velocidades muito pequenas para evitar cálculos desnecessários
      if (Math.abs(physics.velocity.x) < 0.001) physics.velocity.x = 0;
      if (Math.abs(physics.velocity.y) < 0.001) physics.velocity.y = 0;

      // Atualiza posição
      transform.position.x += physics.velocity.x * timeScale;
      transform.position.y += physics.velocity.y * timeScale;

      // Atualiza rotação
      transform.rotation += physics.angularVelocity * timeScale;

      // Normaliza a rotação para manter entre 0 e 2π
      transform.rotation = transform.rotation % (Math.PI * 2);
      if (transform.rotation < 0) transform.rotation += Math.PI * 2;

      // Wrap nas bordas se configurado
      if (physics.wrapAroundEdges) {
        if (transform.position.x < 0) transform.position.x += width;
        if (transform.position.x > width) transform.position.x -= width;
        if (transform.position.y < 0) transform.position.y += height;
        if (transform.position.y > height) transform.position.y -= height;
      }

      // Reseta aceleração a cada frame
      // A aceleração é aplicada apenas durante um frame, a menos que seja continuamente reaplicada
      physics.acceleration.x = 0;
      physics.acceleration.y = 0;
    });
  }
}
