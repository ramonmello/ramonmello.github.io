import { Entity } from "./Entity";
import { System } from "./System";
import {
  MessageBus,
  MessageData,
  MessageHandler,
} from "@/engine/core/messaging/MessageBus";

export class World {
  private entities: Map<string, Entity> = new Map();

  private systems: System[] = [];

  private elapsedTime: number = 0;

  private lastUpdateTime: number = 0;

  private messageDisposers: Array<() => void> = [];

  private running: boolean = false;

  addEntity(entity: Entity): World {
    this.entities.set(entity.id, entity);
    this.emit("entityAdded", { entity });
    return this;
  }

  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.destroy();
      this.entities.delete(id);
      this.emit("entityRemoved", { entityId: id });
    }
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  addSystem(system: System): World {
    system.setWorld(this);
    this.systems.push(system);

    this.systems.sort((a, b) => a.priority - b.priority);

    if (system.init) {
      system.init(this);
    }

    return this;
  }

  emit(messageType: string, data: MessageData = {}): void {
    MessageBus.getInstance().emit(messageType, {
      world: this,
      ...data,
    });
  }

  on(messageType: string, handler: MessageHandler): World {
    const disposer = MessageBus.getInstance().on(messageType, handler);
    this.messageDisposers.push(disposer);
    return this;
  }

  clearAllListeners(): void {
    this.messageDisposers.forEach((disposer) => disposer());
    this.messageDisposers = [];
  }

  start(): void {
    if (!this.running) {
      this.running = true;
      this.emit("worldStarted", {});
    }
  }

  stop(): void {
    if (this.running) {
      this.running = false;
      this.emit("worldStopped", {});
    }
  }

  update(deltaTime: number): void {
    if (!this.running) return;

    this.elapsedTime += deltaTime;
    this.lastUpdateTime = performance.now();

    this.emit("preUpdate", { deltaTime });

    for (const system of this.systems) {
      if (!system.enabled) continue;

      const eligibleEntities = Array.from(this.entities.values()).filter(
        (entity) => system.shouldProcessEntity(entity)
      );

      system.update(eligibleEntities, deltaTime);
    }

    this.emit("postUpdate", { deltaTime });
  }

  getEntitiesWith(...componentTypes: string[]): Entity[] {
    return Array.from(this.entities.values()).filter((entity) =>
      componentTypes.every((type) => entity.hasComponent(type))
    );
  }

  getElapsedTime(): number {
    return this.elapsedTime;
  }

  clear(): void {
    this.entities.forEach((entity) => entity.destroy());
    this.entities.clear();

    this.systems = [];

    this.clearAllListeners();

    this.elapsedTime = 0;
    this.lastUpdateTime = 0;

    this.emit("worldCleared", {});
  }

  destroy(): void {
    this.stop();
    this.clear();
    this.emit("worldDestroyed", {});
    MessageBus.getInstance().clearAllListeners();
  }
}
