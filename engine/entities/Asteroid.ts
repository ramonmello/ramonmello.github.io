// src/engine/entities/Asteroid.ts

import { getWebGLContext } from "../core/WebGLContext";

/**
 * Asteroid — representa um asteroide no jogo
 */
export class Asteroid {
  public position: { x: number; y: number };
  public size: number;
  private rotation: number;
  private rotationSpeed: number;
  private velocity: { x: number; y: number };
  private vertices: Float32Array;

  constructor(x: number, y: number, size = 30) {
    this.position = { x, y };
    this.size = size;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;

    const speed = 0.5 + Math.random() * 1;
    const angle = Math.random() * Math.PI * 2;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };

    this.vertices = this.generateVertices();
  }

  /** Gera os vértices irregulares do asteroide */
  private generateVertices(): Float32Array {
    const points: number[] = [];
    const numPoints = 8;
    const angleStep = (Math.PI * 2) / numPoints;

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep;
      const radius = this.size * (0.8 + Math.random() * 0.4);
      points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }

    return new Float32Array(points);
  }

  /** Atualiza posição, rotação e wrapping na borda */
  update(): void {
    const { canvas } = getWebGLContext();

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.rotation += this.rotationSpeed;

    if (this.position.x < -this.size)
      this.position.x = canvas.width + this.size;
    if (this.position.x > canvas.width + this.size)
      this.position.x = -this.size;
    if (this.position.y < -this.size)
      this.position.y = canvas.height + this.size;
    if (this.position.y > canvas.height + this.size)
      this.position.y = -this.size;
  }

  /** Desenha o asteroide usando o contexto WebGL singleton */
  draw(): void {
    const ctx = getWebGLContext();
    const { gl, positionBuffer, locs, canvas } = ctx;

    // 🔧 Guard: locs só existe após initShaders()
    if (!locs || !locs.program) {
      throw new Error(
        "WebGLContext.locs não inicializado. " +
          "Certifique‑se de chamar initShaders() antes de qualquer draw()."
      );
    }

    gl.useProgram(locs.program);
    gl.uniform2f(locs.u_resolution, canvas.width, canvas.height);
    gl.uniform2f(locs.u_translation, this.position.x, this.position.y);
    gl.uniform1f(locs.u_rotation, this.rotation);
    gl.uniform4f(locs.u_color, 0.8, 0.8, 0.8, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(locs.a_position);
    gl.vertexAttribPointer(locs.a_position, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINE_LOOP, 0, this.vertices.length / 2);
  }

  /**
   * Cria um asteroide fora da tela, em uma das quatro bordas
   */
  static createOutsideCanvas(size = 30): Asteroid {
    const { canvas } = getWebGLContext();
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (side) {
      case 0: // topo
        x = Math.random() * canvas.width;
        y = -size;
        break;
      case 1: // direita
        x = canvas.width + size;
        y = Math.random() * canvas.height;
        break;
      case 2: // bottom
        x = Math.random() * canvas.width;
        y = canvas.height + size;
        break;
      case 3: // esquerda
      default:
        x = -size;
        y = Math.random() * canvas.height;
        break;
    }

    return new Asteroid(x, y, size);
  }
}
