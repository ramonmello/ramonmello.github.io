import { System } from "@engine/core/base/System";
import { World } from "@engine/core/base/World";
import { Entity } from "@engine/core/base/Entity";
import { TransformComponent } from "@engine/core/components/TransformComponent";
import { ParticleEmitterComponent } from "@engine/core/components/ParticleEmitterComponent";
import {
  PLAYER_EVENTS,
  PROJECTILE_EVENTS,
} from "@engine/core/messaging/MessageTypes";
import { MessageData } from "@engine/core/messaging/MessageBus";
import { EmitterConfig } from "@engine/core/rendering/particles";

const EXPLOSION_SMALL: EmitterConfig = {
  num: 80,
  speed: [1, 3],
  size: [1, 2],
  duration: 1.0,
};

interface HitData extends MessageData {
  position: { x: number; y: number };
}

export class ExplosionSpawnSystem extends System {
  readonly componentTypes: string[] = [];

  constructor(protected world: World) {
    super();
    this.world.on(PROJECTILE_EVENTS.HIT, (d) => {
      this.spawn((d as HitData).position);
    });

    this.world.on(PLAYER_EVENTS.DIE, (d) => {
      this.spawn((d as HitData).position);
    });
  }

  update(): void {
    /* nada – apenas responde a eventos */
  }

  private spawn(pos: { x: number; y: number }) {
    const e = new Entity(`explosion_${crypto.randomUUID()}`);
    e.addComponent(new TransformComponent(pos.x, pos.y, 0));
    e.addComponent(new ParticleEmitterComponent(EXPLOSION_SMALL));

    this.world.addEntity(e);
  }
}
