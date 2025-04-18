import { getWebGLContext } from "../core/WebGLContext";

/**
 * Projectile — projétil disparado pela nave
 */
export class Projectile {
  public pos: { x: number; y: number };
  private vel: { x: number; y: number };
  private lifeTime = 0;
  private readonly maxLifeTime: number;
  private wrapped = false;
  private readonly vertices: Float32Array;

  constructor(
    x: number,
    y: number,
    rotation: number,
    speed = 5,
    maxLifeTime = 120
  ) {
    this.pos = { x, y };
    this.vel = {
      x: -Math.sin(rotation) * speed,
      y: Math.cos(rotation) * speed,
    };
    this.maxLifeTime = maxLifeTime;
    this.vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  }

  /**
   * Atualiza posição, wrapping e retorna true se expirou
   */
  update(): boolean {
    const { canvas } = getWebGLContext();
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.lifeTime++;

    // wrapping
    if (this.pos.x < 0) {
      this.pos.x = canvas.width;
      this.wrapped = true;
    }
    if (this.pos.x > canvas.width) {
      this.pos.x = 0;
      this.wrapped = true;
    }
    if (this.pos.y < 0) {
      this.pos.y = canvas.height;
      this.wrapped = true;
    }
    if (this.pos.y > canvas.height) {
      this.pos.y = 0;
      this.wrapped = true;
    }

    // expira (lifeTime extra após wrap)
    const extra = this.wrapped ? 30 : 0;
    return this.lifeTime > this.maxLifeTime + extra;
  }

  /**
   * Desenha o projétil usando o contexto WebGL singleton
   */
  draw(): void {
    const { gl, canvas, positionBuffer, locs } = getWebGLContext();

    gl.useProgram(locs.program);
    gl.uniform2f(locs.u_resolution, canvas.width, canvas.height);
    gl.uniform2f(locs.u_translation, this.pos.x, this.pos.y);
    gl.uniform1f(locs.u_rotation, 0);
    gl.uniform4f(locs.u_color, 1, 1, 1, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(locs.a_position);
    gl.vertexAttribPointer(locs.a_position, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
