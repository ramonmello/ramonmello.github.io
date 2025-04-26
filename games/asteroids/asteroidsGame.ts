import { BaseGame } from "@/engine/scaffold/BaseGame";
import { GameConfig } from "@/engine/scaffold/Game";
import { World } from "@/engine/core/base/World";
import { PhysicsSystem } from "@/engine/core/systems/PhysicsSystem";
import { RenderSystem } from "@/engine/core/systems/RenderSystem";
import { Entity } from "@/engine/core/base/Entity";
import { ShipControlSystem } from "./systems/ShipControlSystem";
import { createShipEntity } from "./entities/ShipEntity";
import { ProjectileSystem } from "./systems/ProjectileSystem";
import { createAsteroidEntity } from "./entities/AsteroidEntity";
import { CollisionSystem } from "@/engine/core/systems/CollisionSystem";
import { AsteroidCollisionCleanupSystem } from "./systems/AsteroidCollisionCleanupSystem";

export interface AsteroidsGameConfig extends GameConfig {
  rotationSpeed: number;
  thrustForce: number;
}

export class AsteroidsGame extends BaseGame {
  name = "Asteroids";

  description = "Arcade-style, multidirectional space shooter";

  private shipEntity?: Entity;

  protected getDefaultConfig(): AsteroidsGameConfig {
    return {
      canvasWidth: 800,
      canvasHeight: 600,
      debug: false,
      rotationSpeed: 0.05,
      thrustForce: 0.1,
    };
  }

  getConfig(): AsteroidsGameConfig {
    return this.config as AsteroidsGameConfig;
  }

  async initialize(world?: World, config?: Partial<GameConfig>): Promise<void> {
    await super.initialize(world, config);
  }

  protected createSystems(): void {
    this.world.addSystem(new PhysicsSystem());
    this.world.addSystem(new RenderSystem(true, [0, 0, 0.1, 0]));

    this.world.addSystem(new ShipControlSystem(this));
    this.world.addSystem(new ProjectileSystem(this.world));

    this.world.addSystem(new CollisionSystem());
    this.world.addSystem(new AsteroidCollisionCleanupSystem());
  }

  private createShip(): void {
    this.shipEntity = createShipEntity();
    this.world.addEntity(this.shipEntity);
  }

  private createAsteroids(): void {
    for (let i = 0; i < 5; i++) {
      this.world.addEntity(createAsteroidEntity());
    }
  }

  protected createEntities(): void {
    this.createShip();
    this.createAsteroids();
  }
}
