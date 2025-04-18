/**
 * Projectile.ts - Define projéteis disparados pela nave
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

// Interfaces comuns
export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export class Projectile {
  position: Position;
  velocity: Velocity;
  lifeTime: number;
  maxLifeTime: number;
  wrapped: boolean;
  vertices: Float32Array;

  constructor(x: number, y: number, rotation: number, speed = 5) {
    this.position = { x, y };
    this.velocity = {
      x: -Math.sin(rotation) * speed,
      y: Math.cos(rotation) * speed,
    };
    this.lifeTime = 0;
    this.maxLifeTime = 120;
    this.wrapped = false;
    this.vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  }

  update(): boolean {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.lifeTime++;

    if (this.position.x < 0) {
      this.position.x = canvas.width;
      this.wrapped = true;
    }
    if (this.position.x > canvas.width) {
      this.position.x = 0;
      this.wrapped = true;
    }
    if (this.position.y < 0) {
      this.position.y = canvas.height;
      this.wrapped = true;
    }
    if (this.position.y > canvas.height) {
      this.position.y = 0;
      this.wrapped = true;
    }

    if (this.wrapped) {
      const extraLifeTime = 30;
      return this.lifeTime > this.maxLifeTime + extraLifeTime;
    }
    return this.lifeTime > this.maxLifeTime;
  }

  draw(): void {
    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform2f(translationUniformLocation, this.position.x, this.position.y);
    gl.uniform1f(rotationUniformLocation, 0);
    gl.uniform4f(colorUniformLocation, 1, 1, 1, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
