import { Component } from "@/engine/core/ecs/base/Component";
import { Vector2 } from "./TransformComponent";

/**
 * Componente que gerencia as propriedades físicas de uma entidade:
 * velocidade, aceleração, fricção, etc.
 */
export class PhysicsComponent extends Component {
  /** Tipo único do componente */
  static readonly TYPE = "physics";

  /** Implementação do getter de tipo exigido pela classe Component */
  get type(): string {
    return PhysicsComponent.TYPE;
  }

  /** Velocidade atual nos eixos X e Y */
  velocity: Vector2;

  /** Aceleração atual nos eixos X e Y */
  acceleration: Vector2;

  /** Velocidade angular (rotação) */
  angularVelocity: number;

  /** Coeficiente de fricção (0 = sem fricção, 1 = fricção máxima) */
  friction: number;

  /** Determina se a posição deve fazer "wrap" nas bordas da tela */
  wrapAroundEdges: boolean;

  /** Massa da entidade (afeta cálculos de colisão) */
  mass: number;

  /** Velocidade máxima permitida */
  maxSpeed?: number;

  /**
   * Construtor
   * @param friction Coeficiente de fricção (padrão: 0.99)
   * @param wrapAroundEdges Se true, a entidade dá a volta nas bordas (padrão: true)
   * @param mass Massa da entidade (padrão: 1)
   * @param maxSpeed Velocidade máxima permitida (opcional)
   */
  constructor(
    friction: number = 0.99,
    wrapAroundEdges: boolean = true,
    mass: number = 1,
    maxSpeed?: number
  ) {
    super();
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.angularVelocity = 0;
    this.friction = friction;
    this.wrapAroundEdges = wrapAroundEdges;
    this.mass = mass;
    this.maxSpeed = maxSpeed;
  }

  /**
   * Define a velocidade da entidade
   * @param x Velocidade no eixo X
   * @param y Velocidade no eixo Y
   * @returns Este componente para encadeamento
   */
  setVelocity(x: number, y: number): PhysicsComponent {
    this.velocity.x = x;
    this.velocity.y = y;
    this.applySpeedLimit();
    return this;
  }

  /**
   * Define a aceleração da entidade
   * @param x Aceleração no eixo X
   * @param y Aceleração no eixo Y
   * @returns Este componente para encadeamento
   */
  setAcceleration(x: number, y: number): PhysicsComponent {
    this.acceleration.x = x;
    this.acceleration.y = y;
    return this;
  }

  /**
   * Define a velocidade angular da entidade
   * @param angularVelocity Nova velocidade angular
   * @returns Este componente para encadeamento
   */
  setAngularVelocity(angularVelocity: number): PhysicsComponent {
    this.angularVelocity = angularVelocity;
    return this;
  }

  /**
   * Define o coeficiente de fricção
   * @param friction Novo coeficiente de fricção
   * @returns Este componente para encadeamento
   */
  setFriction(friction: number): PhysicsComponent {
    this.friction = friction;
    return this;
  }

  /**
   * Define se a entidade deve dar a volta nas bordas
   * @param wrap true para dar a volta, false para não
   * @returns Este componente para encadeamento
   */
  setWrapAroundEdges(wrap: boolean): PhysicsComponent {
    this.wrapAroundEdges = wrap;
    return this;
  }

  /**
   * Define a massa da entidade
   * @param mass Nova massa
   * @returns Este componente para encadeamento
   */
  setMass(mass: number): PhysicsComponent {
    this.mass = mass;
    return this;
  }

  /**
   * Define a velocidade máxima da entidade
   * @param maxSpeed Nova velocidade máxima (undefined para sem limite)
   * @returns Este componente para encadeamento
   */
  setMaxSpeed(maxSpeed?: number): PhysicsComponent {
    this.maxSpeed = maxSpeed;
    this.applySpeedLimit();
    return this;
  }

  /**
   * Aplica uma força à entidade, resultando em aceleração
   * @param forceX Componente X da força
   * @param forceY Componente Y da força
   * @returns Este componente para encadeamento
   */
  applyForce(forceX: number, forceY: number): PhysicsComponent {
    // F = ma => a = F/m
    this.acceleration.x += forceX / this.mass;
    this.acceleration.y += forceY / this.mass;
    return this;
  }

  /**
   * Aplica um impulso à entidade, resultando em mudança imediata de velocidade
   * @param impulseX Componente X do impulso
   * @param impulseY Componente Y do impulso
   * @returns Este componente para encadeamento
   */
  applyImpulse(impulseX: number, impulseY: number): PhysicsComponent {
    // Impulso = mudança no momentum => v' = v + impulso/m
    this.velocity.x += impulseX / this.mass;
    this.velocity.y += impulseY / this.mass;
    this.applySpeedLimit();
    return this;
  }

  /**
   * Aplica o limite de velocidade configurado
   */
  private applySpeedLimit(): void {
    if (this.maxSpeed !== undefined) {
      const currentSpeed = Math.hypot(this.velocity.x, this.velocity.y);
      if (currentSpeed > this.maxSpeed) {
        const scaleFactor = this.maxSpeed / currentSpeed;
        this.velocity.x *= scaleFactor;
        this.velocity.y *= scaleFactor;
      }
    }
  }
}
