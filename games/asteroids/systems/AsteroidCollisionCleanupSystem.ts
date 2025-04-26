import { System } from "@/engine/core/base/System";
import { World } from "@/engine/core/base/World";
import { Entity } from "@/engine/core/base/Entity";
import {
  COLLISION_EVENTS,
  PROJECTILE_EVENTS,
  WORLD_EVENTS,
} from "@/engine/core/messaging/MessageTypes";
import { ProjectileComponent } from "../components/ProjectileComponent";
import { MessageData } from "@/engine/core/messaging/MessageBus";
import { TransformComponent } from "@/engine/core/components/TransformComponent";

export class AsteroidCollisionCleanupSystem extends System {
  readonly componentTypes: string[] = [];

  priority = 0;

  private pendingRemovals = new Set<string>();

  init(world: World): void {
    this.world = world;
    this.world.on(COLLISION_EVENTS.RESOLVE, this.handleResolve);
    this.world.on(WORLD_EVENTS.POST_UPDATE, this.flushRemovals);
  }

  update(): void {}

  private handleResolve = (data: MessageData) => {
    const entityA = data.entityA as Entity;
    const entityB = data.entityB as Entity;

    const aIsProj = !!entityA.getComponent<ProjectileComponent>(
      ProjectileComponent.TYPE
    );
    const bIsProj = !!entityB.getComponent<ProjectileComponent>(
      ProjectileComponent.TYPE
    );
    if (aIsProj === bIsProj) return;

    const proj = aIsProj ? entityA : entityB;
    const astro = aIsProj ? entityB : entityA;

    this.pendingRemovals.add(proj.id);
    this.pendingRemovals.add(astro.id);

    const astroTransform = astro.getComponent<TransformComponent>(
      TransformComponent.TYPE
    );

    if (astroTransform && this.world) {
      this.world.emit(PROJECTILE_EVENTS.HIT, {
        position: {
          x: astroTransform.position.x,
          y: astroTransform.position.y,
        },
      });
    }
  };

  private flushRemovals = () => {
    for (const id of this.pendingRemovals) {
      this.world?.removeEntity(id);
    }
    this.pendingRemovals.clear();
  };
}
