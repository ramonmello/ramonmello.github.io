import { Component } from "@/engine/core/ecs/base/Component";
import { Entity } from "@/engine/core/ecs/base/Entity";

/**
 * Componente que gerencia as propriedades específicas de um projétil
 */
export class ProjectileComponent extends Component {
  /** Tipo único do componente */
  static readonly TYPE = "projectile";

  /** Implementação do getter de tipo exigido pela classe Component */
  get type(): string {
    return ProjectileComponent.TYPE;
  }

  /** Tempo de vida do projétil em frames */
  // lifespan: number;

  /**Tempo de vida restante do projétil em segundos */
  remainingTime: number;

  /** Tempo decorrido desde a criação */
  age: number = 0;

  /** Dano causado pelo projétil */
  damage: number = 1;

  /** Entidade que disparou o projétil */
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
    return this.age >= this.lifespan;
  }
}
