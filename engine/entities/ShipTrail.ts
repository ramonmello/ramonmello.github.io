import { getWebGLContext } from "../core/WebGLContext";

/**
 * ShipTrail — desenha um triângulo transparente representando o rastro da nave
 */
export class ShipTrail {
  /** vértices de triângulo idênticos à nave */
  private readonly vertices = new Float32Array([0, 22.5, -7.5, -15, 7.5, -15]);

  constructor(
    private x: number,
    private y: number,
    private rotation: number,
    private opacity: number
  ) {}

  /** Desenha o triângulo com transparência decrescente */
  draw(): void {
    const { gl, canvas, positionBuffer, locs } = getWebGLContext();

    gl.useProgram(locs.program);
    gl.uniform2f(locs.u_resolution, canvas.width, canvas.height);
    gl.uniform2f(locs.u_translation, this.x, this.y);
    gl.uniform1f(locs.u_rotation, this.rotation);
    gl.uniform4f(locs.u_color, 1, 1, 1, this.opacity);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(locs.a_position);
    gl.vertexAttribPointer(locs.a_position, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
