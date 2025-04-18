/**
 * Ship.ts - Define a nave controlada pelo jogador
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
import { keys } from "../utils/input";
import { Projectile, Position, Velocity } from "./Projectile";
import { Explosion } from "./Explosion";

// Interface para posição de rastro
export interface TrailPosition extends Position {
  rotation: number;
}

// Classe para desenhar o rastro da nave
export class ShipTrail {
  position: Position;
  rotation: number;
  opacity: number;
  vertices: Float32Array;

  constructor(x: number, y: number, rotation: number, opacity: number) {
    this.position = { x, y };
    this.rotation = rotation;
    this.opacity = opacity;
    this.vertices = new Float32Array([0, 22.5, -7.5, -15, 7.5, -15]);
  }

  draw(): void {
    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform2f(translationUniformLocation, this.position.x, this.position.y);
    gl.uniform1f(rotationUniformLocation, this.rotation);
    gl.uniform4f(colorUniformLocation, 1, 1, 1, this.opacity);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

// Classe principal da nave
export class Ship {
  position: Position;
  velocity: Velocity;
  rotation: number;
  acceleration: number;
  maxSpeed: number;
  rotationSpeed: number;
  friction: number;
  lastShot: number;
  shotCooldown: number;
  isDestroyed: boolean;
  trailPositions: TrailPosition[];
  maxTrailLength: number;
  trailUpdateCounter: number;
  trailUpdateInterval: number;
  vertices: Float32Array;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.acceleration = 0.1;
    this.maxSpeed = 3;
    this.rotationSpeed = 0.05;
    this.friction = 0.99;
    this.lastShot = 0;
    this.shotCooldown = 15;
    this.isDestroyed = false;
    this.trailPositions = [];
    this.maxTrailLength = 10;
    this.trailUpdateCounter = 0;
    this.trailUpdateInterval = 4;
    this.vertices = new Float32Array([0, 22.5, -7.5, -15, 7.5, -15]);
  }

  update(): void {
    if (this.isDestroyed) {
      return;
    }

    // Ship rotation
    if (keys.ArrowLeft || keys.KeyA) this.rotation -= this.rotationSpeed;
    if (keys.ArrowRight || keys.KeyD) this.rotation += this.rotationSpeed;

    // Thrust and friction
    if (keys.ArrowUp || keys.KeyW) {
      this.velocity.x -= Math.sin(this.rotation) * this.acceleration;
      this.velocity.y += Math.cos(this.rotation) * this.acceleration;

      const speed = Math.hypot(this.velocity.x, this.velocity.y);
      if (speed > this.maxSpeed) {
        this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
        this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
      }
    } else {
      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;
      if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
      if (Math.abs(this.velocity.y) < 0.01) this.velocity.y = 0;
    }

    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Boundary check
    if (this.position.x < 0) this.position.x = canvas.width;
    if (this.position.x > canvas.width) this.position.x = 0;
    if (this.position.y < 0) this.position.y = canvas.height;
    if (this.position.y > canvas.height) this.position.y = 0;

    this.lastShot++;
    this.updateTrail();
  }

  updateTrail(): void {
    this.trailUpdateCounter++;

    if (this.trailUpdateCounter >= this.trailUpdateInterval) {
      this.trailUpdateCounter = 0;

      this.trailPositions.unshift({
        x: this.position.x,
        y: this.position.y,
        rotation: this.rotation,
      });

      if (this.trailPositions.length > this.maxTrailLength) {
        this.trailPositions.pop();
      }
    }
  }

  shoot(): Projectile | null {
    if (this.lastShot >= this.shotCooldown) {
      const tipX = this.position.x - Math.sin(this.rotation) * 22.5;
      const tipY = this.position.y + Math.cos(this.rotation) * 22.5;
      const projectile = new Projectile(tipX, tipY, this.rotation);
      this.lastShot = 0;
      return projectile;
    }
    return null;
  }

  destroy(): Explosion | null {
    if (this.isDestroyed) return null;
    this.isDestroyed = true;
    this.trailPositions = [];
    return new Explosion(this.position.x, this.position.y);
  }

  respawn(): void {
    this.isDestroyed = false;
    this.position = { x: canvas.width / 2, y: canvas.height / 2 };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
  }

  draw(): void {
    if (this.isDestroyed) return;

    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform2f(translationUniformLocation, this.position.x, this.position.y);
    gl.uniform1f(rotationUniformLocation, this.rotation);
    gl.uniform4f(colorUniformLocation, 1, 1, 1, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
