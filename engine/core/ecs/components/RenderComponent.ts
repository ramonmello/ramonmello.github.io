import { Component } from "@/engine/core/ecs/base/Component";

/**
 * Interface para representar uma cor RGBA
 */
export interface Color {
  r: number; // 0 a 1
  g: number; // 0 a 1
  b: number; // 0 a 1
  a: number; // 0 a 1
}

/**
 * Componente que gerencia a renderização visual de uma entidade
 */
export class RenderComponent extends Component {
  /** Tipo único do componente */
  static readonly TYPE = "render";

  /** Implementação do getter de tipo exigido pela classe Component */
  get type(): string {
    return RenderComponent.TYPE;
  }

  /** Vértices da forma a ser renderizada */
  vertices: Float32Array;

  /** Cor a ser aplicada na renderização */
  color: Color;

  /** Indica se a entidade deve ser renderizada */
  visible: boolean = true;

  /** Ordem de renderização (valores maiores são renderizados por cima) */
  zIndex: number = 0;

  /** Tipo de primitiva (triangulos, linhas, etc) */
  drawMode: "triangles" | "lines" | "line_loop" | "points" = "triangles";

  /**
   * Construtor
   * @param vertices Vértices do objeto a ser renderizado
   * @param color Cor opcional (padrão: branco)
   */
  constructor(
    vertices: Float32Array,
    color: Partial<Color> = { r: 1, g: 1, b: 1, a: 1 }
  ) {
    super();
    this.vertices = vertices;
    this.color = {
      r: color.r ?? 1,
      g: color.g ?? 1,
      b: color.b ?? 1,
      a: color.a ?? 1,
    };
  }

  /**
   * Define a cor do componente
   * @param r Componente vermelho (0-1)
   * @param g Componente verde (0-1)
   * @param b Componente azul (0-1)
   * @param a Componente alfa (0-1)
   * @returns Este componente para encadeamento
   */
  setColor(r: number, g: number, b: number, a: number = 1): RenderComponent {
    this.color = { r, g, b, a };
    return this;
  }

  /**
   * Define a visibilidade do componente
   * @param visible true para visível, false para invisível
   * @returns Este componente para encadeamento
   */
  setVisible(visible: boolean): RenderComponent {
    this.visible = visible;
    return this;
  }

  /**
   * Define a ordem de renderização
   * @param zIndex Novo zIndex
   * @returns Este componente para encadeamento
   */
  setZIndex(zIndex: number): RenderComponent {
    this.zIndex = zIndex;
    return this;
  }

  /**
   * Define o modo de desenho
   * @param mode Modo de desenho ('triangles', 'lines', 'points')
   * @returns Este componente para encadeamento
   */
  setDrawMode(
    mode: "triangles" | "lines" | "line_loop" | "points"
  ): RenderComponent {
    this.drawMode = mode;
    return this;
  }

  /**
   * Atualiza os vértices do componente
   * @param vertices Novos vértices
   * @returns Este componente para encadeamento
   */
  setVertices(vertices: Float32Array): RenderComponent {
    this.vertices = vertices;
    return this;
  }

  /**
   * Cria uma forma retangular
   * @param width Largura do retângulo
   * @param height Altura do retângulo
   * @returns Um novo componente RenderComponent configurado como retângulo
   */
  static createRectangle(width: number, height: number): RenderComponent {
    // Cria um retângulo centralizado na origem
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // 6 vértices para 2 triângulos que formam o retângulo
    const vertices = new Float32Array([
      -halfWidth,
      -halfHeight, // Vértice inferior esquerdo
      halfWidth,
      -halfHeight, // Vértice inferior direito
      halfWidth,
      halfHeight, // Vértice superior direito

      halfWidth,
      halfHeight, // Vértice superior direito
      -halfWidth,
      halfHeight, // Vértice superior esquerdo
      -halfWidth,
      -halfHeight, // Vértice inferior esquerdo
    ]);

    return new RenderComponent(vertices);
  }

  /**
   * Cria uma forma triangular
   * @param size Tamanho do triângulo
   * @returns Um novo componente RenderComponent configurado como triângulo
   */
  static createTriangle(size: number): RenderComponent {
    // Tamanho do triângulo equilátero
    const halfSize = size / 2;
    const height = (Math.sqrt(3) / 2) * size;

    // 3 vértices para o triângulo
    const vertices = new Float32Array([
      0,
      height / 2, // Vértice superior
      -halfSize,
      -height / 2, // Vértice inferior esquerdo
      halfSize,
      -height / 2, // Vértice inferior direito
    ]);

    return new RenderComponent(vertices);
  }

  /**
   * Cria uma forma circular aproximada
   * @param radius Raio do círculo
   * @param segments Número de segmentos para aproximar o círculo
   * @returns Um novo componente RenderComponent configurado como círculo
   */
  static createCircle(radius: number, segments: number = 20): RenderComponent {
    // Criar vertices para um "círculo" baseado em um polígono regular
    const vertices = new Float32Array(segments * 3 * 2); // 3 pontos por triângulo * 2 coordenadas por ponto

    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;

      // Centro
      vertices[i * 6] = 0;
      vertices[i * 6 + 1] = 0;

      // Ponto no perímetro 1
      vertices[i * 6 + 2] = Math.cos(angle1) * radius;
      vertices[i * 6 + 3] = Math.sin(angle1) * radius;

      // Ponto no perímetro 2
      vertices[i * 6 + 4] = Math.cos(angle2) * radius;
      vertices[i * 6 + 5] = Math.sin(angle2) * radius;
    }

    return new RenderComponent(vertices);
  }
}
