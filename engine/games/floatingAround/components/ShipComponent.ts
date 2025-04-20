import { Component } from "@/engine/core/ecs/base/Component";
import { Vector2 } from "@/engine/core/ecs/components/TransformComponent";

/**
 * Componente que gerencia as propriedades específicas da nave do jogador
 */
export class ShipComponent extends Component {
  /** Tipo único do componente */
  static readonly TYPE = "ship";

  /** Implementação do getter de tipo exigido pela classe Component */
  get type(): string {
    return ShipComponent.TYPE;
  }

  /** Tempo de recarga entre tiros (em frames) */
  shootCooldown: number = 10;

  /** Tempo desde o último tiro */
  lastShot: number = 0;

  /** Velocidade de aceleração da nave */
  thrustPower: number = 0.2;

  /** Velocidade de rotação da nave */
  rotationSpeed: number = 0.1;

  /** Indica se os propulsores estão ativos */
  thrusting: boolean = false;

  /** Indica se a nave está atualmente invencível */
  invincible: boolean = false;

  /** Tempo restante de invencibilidade (em frames) */
  invincibilityTime: number = 0;

  /** Posições recentes da nave para criar efeito de rastro */
  trailPositions: { position: Vector2; rotation: number }[] = [];

  /** Número máximo de posições no rastro */
  maxTrailLength: number = 5;

  /**
   * Construtor
   * @param shootCooldown Tempo entre tiros (padrão: 10)
   * @param thrustPower Força de aceleração (padrão: 0.2)
   * @param rotationSpeed Velocidade de rotação (padrão: 0.1)
   */
  constructor(
    shootCooldown: number = 10,
    thrustPower: number = 0.2,
    rotationSpeed: number = 0.1
  ) {
    super();
    this.shootCooldown = shootCooldown;
    this.thrustPower = thrustPower;
    this.rotationSpeed = rotationSpeed;
  }

  /**
   * Ativa a invencibilidade temporária
   * @param time Duração da invencibilidade em frames
   */
  setInvincible(time: number): void {
    this.invincible = true;
    this.invincibilityTime = time;
  }

  /**
   * Atualiza o componente
   * @param deltaTime Tempo desde a última atualização
   * TODO: Analisar se será necessário o deltaTime
   */
  update(deltaTime: number): void {
    // Atualiza o temporizador de recarga
    if (this.lastShot > 0) {
      this.lastShot = Math.max(0, this.lastShot - 1);
    }

    // Atualiza o temporizador de invencibilidade
    if (this.invincible && this.invincibilityTime > 0) {
      this.invincibilityTime -= 1;
      if (this.invincibilityTime <= 0) {
        this.invincible = false;
      }
    }
  }

  /**
   * Verifica se o jogador pode atirar
   */
  canShoot(): boolean {
    return this.lastShot <= 0;
  }

  /**
   * Registra um tiro
   */
  shoot(): void {
    this.lastShot = this.shootCooldown;
  }

  /**
   * Atualiza o rastro da nave
   * @param position Posição atual
   * @param rotation Rotação atual
   */
  updateTrail(position: Vector2, rotation: number): void {
    this.trailPositions.unshift({
      position: { x: position.x, y: position.y },
      rotation,
    });

    // Limita o tamanho do rastro
    if (this.trailPositions.length > this.maxTrailLength) {
      this.trailPositions.pop();
    }
  }
}
