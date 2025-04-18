/**
 * Asteroid.ts - Define os asteroides do jogo
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

export class Asteroid {
  position: Position;
  size: number;
  rotation: number;
  rotationSpeed: number;
  velocity: Velocity;
  vertices: Float32Array;

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

  generateVertices(): Float32Array {
    const vertices = [];
    const numPoints = 8;
    const angleStep = (Math.PI * 2) / numPoints;

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep;
      const radius = this.size * (0.8 + Math.random() * 0.4);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      vertices.push(x, y);
    }

    return new Float32Array(vertices);
  }

  update(): void {
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

  draw(): void {
    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform2f(translationUniformLocation, this.position.x, this.position.y);
    gl.uniform1f(rotationUniformLocation, this.rotation);
    gl.uniform4f(colorUniformLocation, 0.8, 0.8, 0.8, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINE_LOOP, 0, this.vertices.length / 2);
  }

  // Cria um asteroide fora da tela
  static createOutsideCanvas(): Asteroid {
    const side = Math.floor(Math.random() * 4);
    let x = 0,
      y = 0;

    switch (side) {
      case 0: // top
        x = Math.random() * canvas.width;
        y = -30;
        break;
      case 1: // right
        x = canvas.width + 30;
        y = Math.random() * canvas.height;
        break;
      case 2: // bottom
        x = Math.random() * canvas.width;
        y = canvas.height + 30;
        break;
      case 3: // left
        x = -30;
        y = Math.random() * canvas.height;
        break;
    }

    return new Asteroid(x, y);
  }
}
