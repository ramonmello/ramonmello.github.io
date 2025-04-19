/**
 * Exemplo de uso do sistema de mensagens
 *
 * Este arquivo demonstra como usar o sistema de mensagens para comunicação
 * desacoplada entre diferentes partes do jogo.
 */

import { Entity } from "../Entity";
import { Component } from "../Component";
import { World } from "../World";
import { System } from "../System";
import { MessageBus } from "../MessageBus";
import { PLAYER_EVENTS, PROJECTILE_EVENTS } from "../MessageTypes";

// Exemplo de componente
class HealthComponent extends Component {
  get type() {
    return "health";
  }
  health: number;
  maxHealth: number;

  constructor(maxHealth: number) {
    super();
    this.maxHealth = maxHealth;
    this.health = maxHealth;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);

    // Emite mensagem que a saúde mudou
    this.entity?.emit("healthChanged", {
      health: this.health,
      maxHealth: this.maxHealth,
    });

    // Se a saúde chegar a zero, emite mensagem de morte
    if (this.health <= 0) {
      this.entity?.emit("entityDied", {});
    }
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.entity?.emit("healthChanged", {
      health: this.health,
      maxHealth: this.maxHealth,
    });
  }
}

// Exemplo de sistema que usa mensagens
class DamageSystem extends System {
  readonly componentTypes = ["health"];

  constructor(world: World) {
    super();

    // Registra para ouvir mensagens de colisão
    world.on("collision", (data) => {
      const { entity1, entity2 } = data;

      // Verifica se ambas entidades têm componente de saúde
      if (entity1.hasComponent("health") && entity2.hasComponent("health")) {
        const health1 = entity1.getComponent<HealthComponent>("health");
        const health2 = entity2.getComponent<HealthComponent>("health");

        // Aplica dano às duas entidades
        health1?.takeDamage(10);
        health2?.takeDamage(10);
      }
    });

    // Registra para ouvir mensagens de projétil
    world.on(PROJECTILE_EVENTS.HIT, (data) => {
      const { target, damage } = data;
      if (target.hasComponent("health")) {
        const health = target.getComponent<HealthComponent>("health");
        health?.takeDamage(damage || 20);
      }
    });
  }

  update(_entities: Entity[], _deltaTime: number): void {
    // Nada a fazer no update, toda a lógica está nos handlers de mensagens
  }
}

// Exemplo de uso
export function setupMessageExample(): void {
  // Cria mundo e entidades
  const world = new World();

  const player = new Entity("player", "Player");
  player.addComponent(new HealthComponent(100));

  const enemy = new Entity("enemy", "Enemy");
  enemy.addComponent(new HealthComponent(50));

  // Adiciona entidades ao mundo
  world.addEntity(player);
  world.addEntity(enemy);

  // Adiciona sistema
  world.addSystem(new DamageSystem(world));

  // Registra ouvinte global para mensagens de morte
  MessageBus.getInstance().on("entityDied", (data) => {
    console.log("Entidade morreu:", data.entity.name);
    world.removeEntity(data.entity.id);
  });

  // Registra ouvinte para mudanças de saúde do jogador
  player.on("healthChanged", (data) => {
    console.log(`Saúde do jogador: ${data.health}/${data.maxHealth}`);
  });

  // Simulando jogador atirando
  player.emit(PLAYER_EVENTS.FIRE, { direction: { x: 1, y: 0 } });

  // Simulando colisão de projétil
  MessageBus.getInstance().emit(PROJECTILE_EVENTS.HIT, {
    target: enemy,
    damage: 25,
  });

  // Iniciando o mundo
  world.start();
}
