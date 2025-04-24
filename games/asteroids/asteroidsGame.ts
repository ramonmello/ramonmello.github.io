import { BaseGame } from "@/engine/scaffold/BaseGame";
import { GameConfig } from "@/engine/scaffold/Game";
import { World } from "@/engine/core/base/World";
import { PhysicsSystem } from "@/engine/core/systems/PhysicsSystem";
import { RenderSystem } from "@/engine/core/systems/RenderSystem";
import { Entity } from "@/engine/core/base/Entity";
import { ShipControlSystem } from "./systems/ShipControlSystem";
import { createShipEntity } from "./entities/ShipEntity";
import { ProjectileSystem } from "./systems/ProjectileSystem";

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
  }

  private createShip(): void {
    this.shipEntity = createShipEntity();
    this.world.addEntity(this.shipEntity);
  }

  protected createEntities(): void {
    this.createShip();
  }
}
