import { Component } from "@/engine/core/ecs/base/Component";
import { Vector2 } from "./TransformComponent";

export enum ColliderType {
  Circle,
  Rectangle,
  Polygon,
}

export class ColliderComponent extends Component {
  static readonly TYPE = "collider";

  get type(): string {
    return ColliderComponent.TYPE;
  }

  /** Tipo de colisor */
  colliderType: ColliderType;

  /** Raio do colisor circular */
  radius?: number;

  /** Largura do colisor retangular */
  width?: number;

  /** Altura do colisor retangular */
  height?: number;

  /** Vértices do colisor poligonal */
  vertices?: Float32Array;

  /** Deslocamento do colisor em relação à posição da entidade */
  offset: Vector2;

  /** Tags para identificar grupos de colisão */
  tags: Set<string>;

  /** Camadas de colisão - define com quais outras camadas este colisor pode colidir */
  layer: number;

  /** Máscara de colisão - define com quais camadas este colisor pode colidir */
  mask: number;

  /** Indica se o colisor está ativo */
  active: boolean;

  /** Indica se o colisor é um gatilho (trigger) que detecta, mas não resolve colisões */
  isTrigger: boolean;

  /**
   * Construtor
   * @param type Tipo de colisor
   */
  constructor(type: ColliderType) {
    super();
    this.colliderType = type;
    this.offset = { x: 0, y: 0 };
    this.tags = new Set();
    this.layer = 1; // Camada padrão
    this.mask = 0xffffffff; // Colide com todas as camadas por padrão
    this.active = true;
    this.isTrigger = false;
  }

  /**
   * Factory para criar um colisor circular
   * @param radius Raio do círculo
   * @returns Novo componente de colisão circular
   */
  static createCircle(radius: number): ColliderComponent {
    const collider = new ColliderComponent(ColliderType.Circle);
    collider.radius = radius;
    return collider;
  }

  /**
   * Factory para criar um colisor retangular
   * @param width Largura do retângulo
   * @param height Altura do retângulo
   * @returns Novo componente de colisão retangular
   */
  static createRectangle(width: number, height: number): ColliderComponent {
    const collider = new ColliderComponent(ColliderType.Rectangle);
    collider.width = width;
    collider.height = height;
    return collider;
  }

  /**
   * Factory para criar um colisor poligonal
   * @param vertices Vértices do polígono
   * @returns Novo componente de colisão poligonal
   */
  static createPolygon(vertices: Float32Array): ColliderComponent {
    const collider = new ColliderComponent(ColliderType.Polygon);
    collider.vertices = vertices;
    return collider;
  }

  /**
   * Define o deslocamento do colisor
   * @param x Deslocamento X
   * @param y Deslocamento Y
   * @returns Este componente para encadeamento
   */
  setOffset(x: number, y: number): ColliderComponent {
    this.offset.x = x;
    this.offset.y = y;
    return this;
  }

  /**
   * Adiciona uma tag ao colisor
   * @param tag Tag a ser adicionada
   * @returns Este componente para encadeamento
   */
  addTag(tag: string): ColliderComponent {
    this.tags.add(tag);
    return this;
  }

  /**
   * Remove uma tag do colisor
   * @param tag Tag a ser removida
   * @returns Este componente para encadeamento
   */
  removeTag(tag: string): ColliderComponent {
    this.tags.delete(tag);
    return this;
  }

  /**
   * Verifica se o colisor tem uma tag específica
   * @param tag Tag a verificar
   * @returns true se o colisor tem a tag, false caso contrário
   */
  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /**
   * Define a camada de colisão
   * @param layer Nova camada
   * @returns Este componente para encadeamento
   */
  setLayer(layer: number): ColliderComponent {
    this.layer = layer;
    return this;
  }

  /**
   * Define a máscara de colisão
   * @param mask Nova máscara
   * @returns Este componente para encadeamento
   */
  setMask(mask: number): ColliderComponent {
    this.mask = mask;
    return this;
  }

  /**
   * Define se o colisor está ativo
   * @param active true para ativo, false para inativo
   * @returns Este componente para encadeamento
   */
  setActive(active: boolean): ColliderComponent {
    this.active = active;
    return this;
  }

  /**
   * Define se o colisor é um gatilho
   * @param isTrigger true para gatilho, false para colisor normal
   * @returns Este componente para encadeamento
   */
  setTrigger(isTrigger: boolean): ColliderComponent {
    this.isTrigger = isTrigger;
    return this;
  }

  /**
   * Verifica se este colisor pode colidir com outro
   * @param other Outro colisor
   * @returns true se podem colidir, false caso contrário
   */
  canCollideWith(other: ColliderComponent): boolean {
    // Verifica se ambos estão ativos
    if (!this.active || !other.active) return false;

    // Verifica camadas de colisão
    if ((this.layer & other.mask) === 0 || (other.layer & this.mask) === 0) {
      return false;
    }

    return true;
  }
}
