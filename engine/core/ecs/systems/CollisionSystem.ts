import { System } from "@/engine/core/ecs/base/System";
import { Entity } from "@/engine/core/ecs/base/Entity";
import { TransformComponent } from "@/engine/core/ecs/components/TransformComponent";
import {
  ColliderComponent,
  ColliderType,
} from "@/engine/core/ecs/components/ColliderComponent";
import { COLLISION_EVENTS } from "@/engine/core/messaging/MessageTypes";

/**
 * Sistema que detecta e notifica colisões entre entidades
 */
export class CollisionSystem extends System {
  /** Define quais componentes uma entidade deve ter para ser processada */
  readonly componentTypes = [TransformComponent.TYPE, ColliderComponent.TYPE];

  /** Prioridade de execução (médio - após física, antes de renderização) */
  priority = 50;

  /**
   * Detecta colisões entre entidades
   * @param entities Lista de entidades que possuem TransformComponent e ColliderComponent
   */
  update(entities: Entity[]): void {
    // Filtra apenas entidades com colisores ativos
    const activeEntities = entities.filter((entity) => {
      const collider = entity.getComponent<ColliderComponent>(
        ColliderComponent.TYPE
      );
      return collider && collider.active;
    });

    // Verifica colisões entre cada par de entidades
    for (let i = 0; i < activeEntities.length; i++) {
      const entityA = activeEntities[i];
      const colliderA = entityA.getComponent<ColliderComponent>(
        ColliderComponent.TYPE
      )!;

      for (let j = i + 1; j < activeEntities.length; j++) {
        const entityB = activeEntities[j];
        const colliderB = entityB.getComponent<ColliderComponent>(
          ColliderComponent.TYPE
        )!;

        // Verifica se os colisores podem colidir entre si
        if (!colliderA.canCollideWith(colliderB)) continue;

        // Detecta colisão
        if (this.checkCollision(entityA, entityB)) {
          // Emite evento de colisão
          this.world?.emit(COLLISION_EVENTS.DETECT, {
            entityA,
            entityB,
            colliderA,
            colliderB,
          });

          // Se nenhum dos colisores é trigger, emite evento de resolução
          if (!colliderA.isTrigger && !colliderB.isTrigger) {
            this.world?.emit(COLLISION_EVENTS.RESOLVE, {
              entityA,
              entityB,
              colliderA,
              colliderB,
            });
          }
        }
      }
    }
  }

  /**
   * Verifica se duas entidades estão colidindo
   * @param entityA Primeira entidade
   * @param entityB Segunda entidade
   * @returns true se há colisão, false caso contrário
   */
  private checkCollision(entityA: Entity, entityB: Entity): boolean {
    const transformA = entityA.getComponent<TransformComponent>(
      TransformComponent.TYPE
    )!;
    const colliderA = entityA.getComponent<ColliderComponent>(
      ColliderComponent.TYPE
    )!;

    const transformB = entityB.getComponent<TransformComponent>(
      TransformComponent.TYPE
    )!;
    const colliderB = entityB.getComponent<ColliderComponent>(
      ColliderComponent.TYPE
    )!;

    // Posições absolutas dos colisores (considerando o offset)
    const posA = {
      x: transformA.position.x + colliderA.offset.x,
      y: transformA.position.y + colliderA.offset.y,
    };

    const posB = {
      x: transformB.position.x + colliderB.offset.x,
      y: transformB.position.y + colliderB.offset.y,
    };

    // Detecção de colisão baseada nos tipos de colisores

    // Caso 1: Círculo vs Círculo
    if (
      colliderA.colliderType === ColliderType.Circle &&
      colliderB.colliderType === ColliderType.Circle
    ) {
      return this.circleCircleCollision(
        posA,
        colliderA.radius || 0,
        posB,
        colliderB.radius || 0
      );
    }

    // Caso 2: Retângulo vs Retângulo
    if (
      colliderA.colliderType === ColliderType.Rectangle &&
      colliderB.colliderType === ColliderType.Rectangle
    ) {
      return this.rectRectCollision(
        posA,
        colliderA.width || 0,
        colliderA.height || 0,
        posB,
        colliderB.width || 0,
        colliderB.height || 0
      );
    }

    // Caso 3: Círculo vs Retângulo
    if (
      colliderA.colliderType === ColliderType.Circle &&
      colliderB.colliderType === ColliderType.Rectangle
    ) {
      return this.circleRectCollision(
        posA,
        colliderA.radius || 0,
        posB,
        colliderB.width || 0,
        colliderB.height || 0
      );
    }

    // Caso 4: Retângulo vs Círculo
    if (
      colliderA.colliderType === ColliderType.Rectangle &&
      colliderB.colliderType === ColliderType.Circle
    ) {
      return this.circleRectCollision(
        posB,
        colliderB.radius || 0,
        posA,
        colliderA.width || 0,
        colliderA.height || 0
      );
    }

    // Para outros tipos de colisores (incluindo polígonos),
    // usamos uma detecção de colisão simplificada por enquanto
    return this.circleCircleCollision(
      posA,
      Math.max(colliderA.radius || 0, 10),
      posB,
      Math.max(colliderB.radius || 0, 10)
    );
  }

  /**
   * Detecta colisão entre dois círculos
   */
  private circleCircleCollision(
    posA: { x: number; y: number },
    radiusA: number,
    posB: { x: number; y: number },
    radiusB: number
  ): boolean {
    // Calcula a distância entre os centros
    const dx = posA.x - posB.x;
    const dy = posA.y - posB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Colisão ocorre quando a distância é menor que a soma dos raios
    return distance < radiusA + radiusB;
  }

  /**
   * Detecta colisão entre dois retângulos
   */
  private rectRectCollision(
    posA: { x: number; y: number },
    widthA: number,
    heightA: number,
    posB: { x: number; y: number },
    widthB: number,
    heightB: number
  ): boolean {
    // Calcula metade das dimensões
    const halfWidthA = widthA / 2;
    const halfHeightA = heightA / 2;
    const halfWidthB = widthB / 2;
    const halfHeightB = heightB / 2;

    // Calcula bordas dos retângulos
    const leftA = posA.x - halfWidthA;
    const rightA = posA.x + halfWidthA;
    const topA = posA.y - halfHeightA;
    const bottomA = posA.y + halfHeightA;

    const leftB = posB.x - halfWidthB;
    const rightB = posB.x + halfWidthB;
    const topB = posB.y - halfHeightB;
    const bottomB = posB.y + halfHeightB;

    // Verifica se não há separação
    return !(
      rightA < leftB ||
      leftA > rightB ||
      bottomA < topB ||
      topA > bottomB
    );
  }

  /**
   * Detecta colisão entre um círculo e um retângulo
   */
  private circleRectCollision(
    circlePos: { x: number; y: number },
    radius: number,
    rectPos: { x: number; y: number },
    width: number,
    height: number
  ): boolean {
    // Calcula metade das dimensões do retângulo
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Calcula a distância entre o centro do círculo e o centro do retângulo
    const dx = Math.abs(circlePos.x - rectPos.x);
    const dy = Math.abs(circlePos.y - rectPos.y);

    // Se a distância for maior que metade da largura/altura + raio, não há colisão
    if (dx > halfWidth + radius) return false;
    if (dy > halfHeight + radius) return false;

    // Se a distância for menor que metade da largura/altura, há colisão
    if (dx <= halfWidth) return true;
    if (dy <= halfHeight) return true;

    // Verifica a distância entre o centro do círculo e o canto mais próximo do retângulo
    const cornerDistanceSq =
      Math.pow(dx - halfWidth, 2) + Math.pow(dy - halfHeight, 2);

    return cornerDistanceSq <= Math.pow(radius, 2);
  }
}
