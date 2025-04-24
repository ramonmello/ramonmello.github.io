import { Entity } from "./Entity";
import { World } from "@/engine/core/ecs/base/World";

export abstract class System {
  abstract readonly componentTypes: string[];

  protected world?: World;

  priority: number = 0;

  enabled: boolean = true;

  setWorld(world: World): void {
    this.world = world;
  }

  shouldProcessEntity(entity: Entity): boolean {
    return this.componentTypes.every((type) => entity.hasComponent(type));
  }

  init?(world: World): void;

  /**
   * Processa todas as entidades elegíveis
   * @param entities Lista de entidades a serem processadas
   * @param deltaTime Tempo desde a última atualização
   */
  abstract update(entities: Entity[], deltaTime: number): void;
}
