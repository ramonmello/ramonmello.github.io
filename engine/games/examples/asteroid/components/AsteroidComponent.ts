import { Component } from "@/engine/core/ecs/base/Component";

/**
 * Tamanhos possíveis de asteroides
 */
export enum AsteroidSize {
  Large = 0, // Asteroide grande
  Medium = 1, // Asteroide médio
  Small = 2, // Asteroide pequeno
}

/**
 * Componente que gerencia as propriedades específicas de um asteroide
 */
export class AsteroidComponent extends Component {
  /** Tipo único do componente */
  static readonly TYPE = "asteroid";

  /** Implementação do getter de tipo exigido pela classe Component */
  get type(): string {
    return AsteroidComponent.TYPE;
  }

  /** Tamanho do asteroide */
  size: AsteroidSize;

  /** Pontuação ao destruir este asteroide */
  points: number;

  /** Indica se o asteroide foi atingido e está em processo de destruição */
  destroying: boolean = false;

  /** Tempo de animação de destruição */
  destroyAnimationTime: number = 0;

  /**
   * Construtor
   * @param size Tamanho do asteroide (padrão: AsteroidSize.Large)
   */
  constructor(size: AsteroidSize = AsteroidSize.Large) {
    super();
    this.size = size;

    // Pontuação baseada no tamanho (menores valem mais)
    switch (size) {
      case AsteroidSize.Large:
        this.points = 20;
        break;
      case AsteroidSize.Medium:
        this.points = 50;
        break;
      case AsteroidSize.Small:
        this.points = 100;
        break;
      default:
        this.points = 10;
    }
  }

  /**
   * Inicia a animação de destruição do asteroide
   * @param duration Duração da animação em frames
   */
  startDestroyAnimation(duration: number): void {
    this.destroying = true;
    this.destroyAnimationTime = duration;
  }

  /**
   * Atualiza a animação de destruição
   * @returns true se a animação acabou, false caso contrário
   */
  updateDestroyAnimation(): boolean {
    if (this.destroying) {
      this.destroyAnimationTime--;
      if (this.destroyAnimationTime <= 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Retorna o raio do asteroide com base no tamanho
   * @returns Raio do asteroide
   */
  getRadius(): number {
    switch (this.size) {
      case AsteroidSize.Large:
        return 40;
      case AsteroidSize.Medium:
        return 20;
      case AsteroidSize.Small:
        return 10;
      default:
        return 30;
    }
  }

  /**
   * Retorna o número de fragmentos gerados ao destruir este asteroide
   * @returns Número de fragmentos
   */
  getFragmentCount(): number {
    switch (this.size) {
      case AsteroidSize.Large:
        return 3;
      case AsteroidSize.Medium:
        return 2;
      case AsteroidSize.Small:
        return 0; // Asteroides pequenos não geram fragmentos
      default:
        return 0;
    }
  }

  /**
   * Retorna o tamanho dos fragmentos gerados ao destruir este asteroide
   * @returns Tamanho dos fragmentos
   */
  getFragmentSize(): AsteroidSize {
    switch (this.size) {
      case AsteroidSize.Large:
        return AsteroidSize.Medium;
      case AsteroidSize.Medium:
        return AsteroidSize.Small;
      default:
        throw new Error("Asteroides pequenos não geram fragmentos");
    }
  }
}
