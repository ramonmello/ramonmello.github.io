// src/engine/entities/Explosion.ts

import { getWebGLContext } from "../core/WebGLContext";

/**
 * Explosion — efeito de explosão com partículas
 */
export class Explosion {
  private position: { x: number; y: number };
  private lifeTime = 0;
  private readonly maxLifeTime = 60;
  private readonly particles: {
    x: number;
    y: number;
    velocity: { x: number; y: number };
    size: number;
  }[] = [];

  constructor(x: number, y: number) {
    const numParticles = 20;
    this.position = { x, y };

    // inicializa partículas com direções e tamanhos aleatórios
    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const speed = 1 + Math.random() * 2;
      this.particles.push({
        x: 0,
        y: 0,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        size: 2 + Math.random() * 3,
      });
    }
  }

  /** Atualiza posição e envelhecimento das partículas */
  update(): boolean {
    this.lifeTime++;

    // move cada partícula e aplica desaceleração
    this.particles.forEach((p) => {
      p.x += p.velocity.x;
      p.y += p.velocity.y;
      p.velocity.x *= 0.95;
      p.velocity.y *= 0.95;
    });

    // devolve true quando a explosão terminou
    return this.lifeTime >= this.maxLifeTime;
  }

  /** Desenha todas as partículas com opacidade decrescente */
  draw(): void {
    const { gl, canvas, positionBuffer, locs } = getWebGLContext();
    const opacity = 1 - this.lifeTime / this.maxLifeTime;

    this.particles.forEach((p) => {
      // quad para cada partícula
      const s = p.size;
      const vertices = new Float32Array([-s, -s, s, -s, -s, s, s, s]);

      gl.useProgram(locs.program);
      gl.uniform2f(locs.u_resolution, canvas.width, canvas.height);
      gl.uniform2f(
        locs.u_translation,
        this.position.x + p.x,
        this.position.y + p.y
      );
      gl.uniform1f(locs.u_rotation, 0);
      gl.uniform4f(locs.u_color, 1, 1, 1, opacity);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(locs.a_position);
      gl.vertexAttribPointer(locs.a_position, 2, gl.FLOAT, false, 0, 0);

      // desenha como TRIANGLE_STRIP para formar um quadrado
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
  }
}
