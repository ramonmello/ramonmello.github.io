/**
 * input.ts - Gerencia a entrada do teclado para o jogo
 */

// Estado das teclas
const keys: Record<string, boolean> = {
  ArrowUp: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
  KeyW: false,
  KeyA: false,
  KeyD: false,
};

// Estado do teclado
let spacePressed = false;
let spaceWasPressed = false;

// Inicializa os listeners de teclado
function initInputControls(): void {
  document.addEventListener("keydown", (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = true;

      if (event.code === "Space" && !spaceWasPressed) {
        spacePressed = true;
        spaceWasPressed = true;
      }
    }
  });

  document.addEventListener("keyup", (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = false;
      if (event.code === "Space") {
        spacePressed = false;
        spaceWasPressed = false;
      }
    }
  });
}

// Reseta o estado do espaço
function resetSpacePressed(): void {
  spacePressed = false;
}

export {
  keys,
  spacePressed,
  spaceWasPressed,
  initInputControls,
  resetSpacePressed,
};
