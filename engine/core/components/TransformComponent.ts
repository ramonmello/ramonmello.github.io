import { Component } from "@/engine/core/base/Component";

/**
 * Interface para representar um ponto 2D
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Componente que gerencia a transformação de uma entidade:
 * posição, rotação e escala
 */
export class TransformComponent extends Component {
  /** Tipo único do componente */
  static readonly TYPE = "transform";

  /** Implementação do getter de tipo exigido pela classe Component */
  get type(): string {
    return TransformComponent.TYPE;
  }

  /** Posição da entidade no espaço 2D */
  position: Vector2;

  /** Rotação da entidade em radianos */
  rotation: number;

  /** Escala da entidade */
  scale: Vector2;

  /**
   * Construtor
   * @param x Posição X inicial (padrão: 0)
   * @param y Posição Y inicial (padrão: 0)
   * @param rotation Rotação inicial em radianos (padrão: 0)
   * @param scaleX Escala X inicial (padrão: 1)
   * @param scaleY Escala Y inicial (padrão: 1)
   */
  constructor(
    x: number = 0,
    y: number = 0,
    rotation: number = 0,
    scaleX: number = 1,
    scaleY: number = 1
  ) {
    super();
    this.position = { x, y };
    this.rotation = rotation;
    this.scale = { x: scaleX, y: scaleY };
  }

  /**
   * Define a posição da entidade
   * @param x Nova posição X
   * @param y Nova posição Y
   * @returns Este componente para encadeamento
   */
  setPosition(x: number, y: number): TransformComponent {
    this.position.x = x;
    this.position.y = y;
    return this;
  }

  /**
   * Define a rotação da entidade
   * @param rotation Nova rotação em radianos
   * @returns Este componente para encadeamento
   */
  setRotation(rotation: number): TransformComponent {
    this.rotation = rotation;
    return this;
  }

  /**
   * Define a escala da entidade
   * @param x Nova escala X
   * @param y Nova escala Y
   * @returns Este componente para encadeamento
   */
  setScale(x: number, y: number): TransformComponent {
    this.scale.x = x;
    this.scale.y = y;
    return this;
  }

  /**
   * Translada a entidade (movimento relativo)
   * @param deltaX Quantidade a mover no eixo X
   * @param deltaY Quantidade a mover no eixo Y
   * @returns Este componente para encadeamento
   */
  translate(deltaX: number, deltaY: number): TransformComponent {
    this.position.x += deltaX;
    this.position.y += deltaY;
    return this;
  }

  /**
   * Rotaciona a entidade (rotação relativa)
   * @param deltaRotation Quantidade a rotacionar em radianos
   * @returns Este componente para encadeamento
   */
  rotate(deltaRotation: number): TransformComponent {
    this.rotation += deltaRotation;
    return this;
  }
}
