/**
 * input.ts — Gerencia a entrada de teclado para o jogo
 */

// estado das teclas
export const keys: Record<string, boolean> = {
  ArrowUp: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
  KeyW: false,
  KeyA: false,
  KeyD: false,
};

// estado de tiro “pulso único”
let spacePressed = false;
let spaceWasPressed = false;

// handlers nomeados para podermos remover depois
let keyDownHandler: (e: KeyboardEvent) => void;
let keyUpHandler: (e: KeyboardEvent) => void;

/**
 * Anexa os listeners ao window. Deve ser chamado em startEngine().
 */
export function attachInputControls(): void {
  keyDownHandler = (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = true;
      if (event.code === "Space" && !spaceWasPressed) {
        spacePressed = true;
        spaceWasPressed = true;
      }
    }
  };

  keyUpHandler = (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = false;
      if (event.code === "Space") {
        spacePressed = false;
        spaceWasPressed = false;
      }
    }
  };

  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);
}

/**
 * Remove os mesmos listeners. Deve ser chamado em stopEngine().
 */
export function detachInputControls(): void {
  window.removeEventListener("keydown", keyDownHandler);
  window.removeEventListener("keyup", keyUpHandler);
}

/**
 * Reseta manualmente o estado de Space quando desejado.
 */
export function resetSpacePressed(): void {
  spacePressed = false;
}

/**
 * API para leitura de pulso de tiro.
 * Deve ser usada em seu Engine update() para disparar apenas uma vez por positivo.
 */
export function consumeSpacePressed(): boolean {
  if (spacePressed) {
    // “consome” um pulso e espera próxima keydown
    resetSpacePressed();
    return true;
  }
  return false;
}

// opcional: expor o flag bruto, caso precise
export { spaceWasPressed };
