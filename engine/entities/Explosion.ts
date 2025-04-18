/**
 * Explosion.ts - Define as explosões quando objetos são destruídos
 */

import {
  gl,
  program,
  positionAttributeLocation,
  resolutionUniformLocation,
  translationUniformLocation,
  rotationUniformLocation,
  colorUniformLocation,
  positionBuffer,
  canvas,
} from "../core/WebGLContext";
import { Position, Velocity } from "./Projectile";

// Interface para partículas de explosão
interface Particle {
  x: number;
  y: number;
  velocity: Velocity;
  size: number;
}

export class Explosion {
  position: Position;
  lifeTime: number;
  maxLifeTime: number;
  particles: Particle[];
  numParticles: number;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.lifeTime = 0;
    this.maxLifeTime = 60;
    this.particles = [];
    this.numParticles = 20;

    for (let i = 0; i < this.numParticles; i++) {
      const angle = (Math.PI * 2 * i) / this.numParticles;
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

  update(): boolean {
    this.lifeTime++;

    this.particles.forEach((particle) => {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.x *= 0.95;
      particle.velocity.y *= 0.95;
    });

    return this.lifeTime >= this.maxLifeTime;
  }

  draw(): void {
    gl.useProgram(program);
    const opacity = 1 - this.lifeTime / this.maxLifeTime;

    this.particles.forEach((particle) => {
      const vertices = new Float32Array([
        -particle.size,
        -particle.size,
        particle.size,
        -particle.size,
        -particle.size,
        particle.size,
        particle.size,
        particle.size,
      ]);

      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform2f(
        translationUniformLocation,
        this.position.x + particle.x,
        this.position.y + particle.y
      );
      gl.uniform1f(rotationUniformLocation, 0);
      gl.uniform4f(colorUniformLocation, 1, 1, 1, opacity);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
  }
}
