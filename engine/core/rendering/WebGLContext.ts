/**
 * WebGLContext.ts — encapsula o contexto WebGL, buffers e locais de atributos/uniforms
 */

export class WebGLContext {
  public gl: WebGLRenderingContext;
  public canvas: HTMLCanvasElement;
  public positionBuffer!: WebGLBuffer;
  public locs!: {
    program: WebGLProgram;
    a_position: number;
    u_resolution: WebGLUniformLocation;
    u_translation: WebGLUniformLocation;
    u_rotation: WebGLUniformLocation;
    u_color: WebGLUniformLocation;
  };

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    const gl = canvasElement.getContext("webgl");
    if (!gl) throw new Error("WebGL not supported");
    this.gl = gl;

    // dimensiona o canvas pra viewport inteira
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  private resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Compila shaders e linka o programa, atribui buffers e locais
   */
  public initShaders(vertexSource: string, fragmentSource: string) {
    const { gl } = this;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s) || "Shader compile error");
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program link error");
    }

    this.positionBuffer = gl.createBuffer()!;
    this.locs = {
      program,
      a_position: gl.getAttribLocation(program, "a_position"),
      u_resolution: gl.getUniformLocation(program, "u_resolution")!,
      u_translation: gl.getUniformLocation(program, "u_translation")!,
      u_rotation: gl.getUniformLocation(program, "u_rotation")!,
      u_color: gl.getUniformLocation(program, "u_color")!,
    };
  }
}

/** Singleton interno **/
let ctx: WebGLContext | null = null;

/**
 * Inicializa o WebGLContext se ainda não existir.
 * Deve ser chamado **uma única vez** antes do startEngine.
 */
export async function initWebGLContext(
  canvasEl: HTMLCanvasElement
): Promise<WebGLContext> {
  if (!ctx) {
    ctx = new WebGLContext(canvasEl);
    // carrega e inicializa shaders aqui
    const [vs, fs] = await Promise.all([
      fetch("/shaders/vertex.glsl").then((r) => r.text()),
      fetch("/shaders/fragment.glsl").then((r) => r.text()),
    ]);
    ctx.initShaders(vs, fs);
  }
  return ctx;
}
/**
 * Retorna o WebGLContext já inicializado.
 * Lança erro se ainda não tiver sido criado.
 */
export function getWebGLContext(): WebGLContext {
  if (!ctx) throw new Error("WebGLContext not initialized");
  return ctx;
}
