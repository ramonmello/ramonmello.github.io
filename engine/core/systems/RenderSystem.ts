import { System } from "@/engine/core/base/System";
import { Entity } from "@/engine/core/base/Entity";
import { TransformComponent } from "@/engine/core/components/TransformComponent";
import { RenderComponent } from "@/engine/core/components/RenderComponent";
import { getWebGLContext } from "@/engine/core/rendering/Context";

export class RenderSystem extends System {
  /** Define quais componentes uma entidade deve ter para ser processada */
  readonly componentTypes = [TransformComponent.TYPE, RenderComponent.TYPE];

  /** Prioridade de execução (maior = executa por último) */
  priority = 100;

  /** Indica se deve limpar a tela antes de renderizar */
  private clearScreen: boolean = true;

  /** Cor de fundo */
  private backgroundColor: [number, number, number, number] = [0, 0, 0, 1];

  /**
   * Construtor
   * @param clearScreen Se true, limpa a tela antes de renderizar
   * @param backgroundColor Cor de fundo RGBA (0-1)
   */
  constructor(
    clearScreen: boolean = true,
    backgroundColor: [number, number, number, number] = [0, 0, 0, 1]
  ) {
    super();
    this.clearScreen = clearScreen;
    this.backgroundColor = backgroundColor;
  }

  /**
   * Renderiza todas as entidades elegíveis
   * @param entities Lista de entidades que possuem TransformComponent e RenderComponent
   */
  update(entities: Entity[]): void {
    const { gl, canvas, positionBuffer, locs } = getWebGLContext();

    if (this.clearScreen) {
      gl.clearColor(
        this.backgroundColor[0],
        this.backgroundColor[1],
        this.backgroundColor[2],
        this.backgroundColor[3]
      );
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const orderedEntities = entities
      .filter((entity) => {
        const render = entity.getComponent<RenderComponent>(
          RenderComponent.TYPE
        );
        return render && render.visible;
      })
      .sort((a, b) => {
        const renderA = a.getComponent<RenderComponent>(RenderComponent.TYPE);
        const renderB = b.getComponent<RenderComponent>(RenderComponent.TYPE);
        if (!renderA || !renderB) return 0;
        return renderA.zIndex - renderB.zIndex;
      });

    orderedEntities.forEach((entity) => {
      const transform = entity.getComponent<TransformComponent>(
        TransformComponent.TYPE
      );
      const render = entity.getComponent<RenderComponent>(RenderComponent.TYPE);

      if (!transform || !render) return;

      gl.useProgram(locs.program);

      gl.uniform2f(locs.u_resolution, canvas.width, canvas.height);
      gl.uniform2f(
        locs.u_translation,
        transform.position.x,
        transform.position.y
      );
      gl.uniform1f(locs.u_rotation, transform.rotation);
      gl.uniform4f(
        locs.u_color,
        render.color.r,
        render.color.g,
        render.color.b,
        render.color.a
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, render.vertices, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(locs.a_position);
      gl.vertexAttribPointer(locs.a_position, 2, gl.FLOAT, false, 0, 0);

      let drawMode: number;
      switch (render.drawMode) {
        case "line_loop":
          drawMode = gl.LINE_LOOP;
          break;
        case "lines":
          drawMode = gl.LINES;
          break;
        case "points":
          drawMode = gl.POINTS;
          break;
        case "triangles":
        default:
          drawMode = gl.TRIANGLES;
          break;
      }

      gl.drawArrays(drawMode, 0, render.vertices.length / 2);
    });
  }

  /**
   * Define se deve limpar a tela antes de renderizar
   * @param clear Se true, limpa a tela antes de renderizar
   */
  setClearScreen(clear: boolean): void {
    this.clearScreen = clear;
  }

  /**
   * Define a cor de fundo
   * @param r Componente vermelho (0-1)
   * @param g Componente verde (0-1)
   * @param b Componente azul (0-1)
   * @param a Componente alfa (0-1)
   */
  setBackgroundColor(r: number, g: number, b: number, a: number = 1): void {
    this.backgroundColor = [r, g, b, a];
  }
}
