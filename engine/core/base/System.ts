import { Entity } from "./Entity";
import { World } from "@/engine/core/base/World";

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

  abstract update(entities: Entity[], deltaTime: number): void;
}
