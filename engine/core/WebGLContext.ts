/**
 * WebGLContext.ts - Gerencia o contexto WebGL e shaders
 */

let canvas: HTMLCanvasElement;
let gl: WebGLRenderingContext;

interface GlobalThis {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
}

// Exponha canvas/gl para partes antigas que possam usar globalThis.canvas
Object.assign(globalThis as unknown as GlobalThis, {
  get canvas() {
    return canvas;
  },
  get gl() {
    return gl;
  },
});

let vertexShaderSource = "";
let fragmentShaderSource = "";
let program: WebGLProgram | null;
let positionAttributeLocation: number;
let resolutionUniformLocation: WebGLUniformLocation | null;
let translationUniformLocation: WebGLUniformLocation | null;
let rotationUniformLocation: WebGLUniformLocation | null;
let colorUniformLocation: WebGLUniformLocation | null;
let positionBuffer: WebGLBuffer | null;

// Carrega os shaders a partir de arquivos
async function loadShaders(): Promise<void> {
  try {
    const [vertexResponse, fragmentResponse] = await Promise.all([
      fetch("shaders/vertex.glsl"),
      fetch("shaders/fragment.glsl"),
    ]);

    vertexShaderSource = await vertexResponse.text();
    fragmentShaderSource = await fragmentResponse.text();
  } catch (error) {
    console.error("Error loading shaders:", error);
  }
}

// Cria um shader a partir do código fonte
function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Inicializa os shaders e programa WebGL
function initShaders(): void {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  if (!vertexShader || !fragmentShader) {
    console.error("Failed to create shaders");
    return;
  }

  if (!gl) return;

  program = gl.createProgram();
  if (!program) {
    console.error("Failed to create program");
    return;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Error linking program:", gl.getProgramInfoLog(program));
  }

  positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  translationUniformLocation = gl.getUniformLocation(program, "u_translation");
  rotationUniformLocation = gl.getUniformLocation(program, "u_rotation");
  colorUniformLocation = gl.getUniformLocation(program, "u_color");

  positionBuffer = gl.createBuffer();
}

// Inicializa o contexto WebGL com um canvas
async function initWebGLContext(
  canvasElement: HTMLCanvasElement
): Promise<void> {
  canvas = canvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl = canvas.getContext("webgl") as WebGLRenderingContext;
  if (!gl) {
    throw new Error("WebGL not supported in this browser");
  }

  gl.clearColor(0, 0, 0, 1);
  gl.viewport(0, 0, canvas.width, canvas.height);

  await loadShaders();
  initShaders();

  // Adiciona listener para redimensionar o canvas
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  });
}

export {
  initWebGLContext,
  gl,
  canvas,
  program,
  positionAttributeLocation,
  resolutionUniformLocation,
  translationUniformLocation,
  rotationUniformLocation,
  colorUniformLocation,
  positionBuffer,
};
