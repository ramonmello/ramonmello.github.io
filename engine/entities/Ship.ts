import { getWebGLContext } from "../core/WebGLContext";
import { Projectile } from "./Projectile";
import type { KeyboardHandler } from "@/hooks/useKeyboard";

/**
 * Ship — nave controlada pelo jogador
 */
export class Ship {
  public pos: { x: number; y: number };
  private vel = { x: 0, y: 0 };
  private rotation = 0;
  private readonly acceleration = 0.1;
  private readonly maxSpeed = 3;
  private readonly rotationSpeed = 0.05;
  private readonly friction = 0.99;

  private lastShot = 0;
  private readonly shotCooldown = 15;
  public isDestroyed = false;

  /** guarda histórico de posições para rastro */
  public trailPositions: { x: number; y: number; rotation: number }[] = [];
  private readonly maxTrailLength = 10;
  private trailCounter = 0;
  private readonly trailInterval = 4;

  /** vértices da própria nave (triângulo) */
  private readonly vertices = new Float32Array([0, 22.5, -7.5, -15, 7.5, -15]);

  constructor(x: number, y: number) {
    this.pos = { x, y };
  }

  /** atualiza movimento, rotação, fricção e trail */
  update(keyboard: KeyboardHandler): void {
    if (this.isDestroyed) return;

    // Obter o estado atual das teclas
    const keys = keyboard.getState();

    // Rotação
    if (keys.ArrowLeft) this.rotation -= this.rotationSpeed;
    if (keys.ArrowRight) this.rotation += this.rotationSpeed;

    // Propulsão
    if (keys.ArrowUp) {
      this.vel.x -= Math.sin(this.rotation) * this.acceleration;
      this.vel.y += Math.cos(this.rotation) * this.acceleration;
      // limitar velocidade
      const speed = Math.hypot(this.vel.x, this.vel.y);
      if (speed > this.maxSpeed) {
        this.vel.x = (this.vel.x / speed) * this.maxSpeed;
        this.vel.y = (this.vel.y / speed) * this.maxSpeed;
      }
    } else {
      // fricção
      this.vel.x *= this.friction;
      this.vel.y *= this.friction;
      if (Math.abs(this.vel.x) < 0.01) this.vel.x = 0;
      if (Math.abs(this.vel.y) < 0.01) this.vel.y = 0;
    }

    // Atualiza posição com wrap nas bordas
    const { canvas } = getWebGLContext();
    this.pos.x = (this.pos.x + this.vel.x + canvas.width) % canvas.width;
    this.pos.y = (this.pos.y + this.vel.y + canvas.height) % canvas.height;

    // Contador de tiro
    this.lastShot++;

    // Registro de trail
    this.trailCounter++;
    if (this.trailCounter >= this.trailInterval) {
      this.trailCounter = 0;
      this.trailPositions.unshift({
        x: this.pos.x,
        y: this.pos.y,
        rotation: this.rotation,
      });
      if (this.trailPositions.length > this.maxTrailLength) {
        this.trailPositions.pop();
      }
    }
  }

  /**
   * Tenta disparar um novo projétil.
   * Retorna null se ainda estiver em cooldown ou destruid​a.
   */
  shoot(): Projectile | null {
    if (this.lastShot < this.shotCooldown || this.isDestroyed) {
      return null;
    }
    this.lastShot = 0;
    const tipX = this.pos.x - Math.sin(this.rotation) * 22.5;
    const tipY = this.pos.y + Math.cos(this.rotation) * 22.5;
    return new Projectile(tipX, tipY, this.rotation);
  }

  /** Marca a nave como destruída e limpa trail */
  destroy(): void {
    this.isDestroyed = true;
    this.trailPositions = [];
  }

  /** Renasce a nave no centro da tela */
  respawn(): void {
    const { canvas } = getWebGLContext();
    this.isDestroyed = false;
    this.pos = { x: canvas.width / 2, y: canvas.height / 2 };
    this.vel = { x: 0, y: 0 };
    this.rotation = 0;
  }

  /** Desenha a nave usando o contexto WebGL singleton */
  draw(): void {
    const { gl, canvas, positionBuffer, locs } = getWebGLContext();

    gl.useProgram(locs.program);
    gl.uniform2f(locs.u_resolution, canvas.width, canvas.height);
    gl.uniform2f(locs.u_translation, this.pos.x, this.pos.y);
    gl.uniform1f(locs.u_rotation, this.rotation);
    gl.uniform4f(locs.u_color, 1, 1, 1, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(locs.a_position);
    gl.vertexAttribPointer(locs.a_position, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
