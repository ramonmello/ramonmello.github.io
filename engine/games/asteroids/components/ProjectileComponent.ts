import { Component } from "@/engine/core/ecs/base/Component";
import { Entity } from "@/engine/core/ecs/base/Entity";

export class ProjectileComponent extends Component {
  static readonly TYPE = "projectile";

  get type(): string {
    return ProjectileComponent.TYPE;
  }

  remainingTime: number;

  damage: number = 1;

  owner?: Entity;

  /**
   * Construtor
   * @param lifespan Tempo de vida em frames (padrão: 60)
   * @param damage Dano causado (padrão: 1)
   * @param owner Entidade que disparou o projétil (opcional)
   */
  constructor(lifespan: number = 60, damage: number = 1, owner?: Entity) {
    super();
    this.remainingTime = lifespan;
    this.damage = damage;
    this.owner = owner;
  }

  /**
   * Atualiza o componente, incrementando a idade do projétil
   * @returns true se o projétil deve ser removido (expirou), false caso contrário
   */
  update(dt: number): boolean {
    this.remainingTime -= dt;
    return this.remainingTime <= 0;
  }

  /**
   * Verifica se o projétil expirou
   * @returns true se expirou, false caso contrário
   */
  hasExpired(): boolean {
    return this.remainingTime <= 0;
  }
}
