import type { KeyboardHandler } from "@/hooks/useKeyboard";
import { InputSystem } from "./InputSystem";

/**
 * Adaptador que converte o hook useKeyboard existente para
 * a interface InputSystem
 */
export class KeyboardInputSystem implements InputSystem {
  constructor(private keyboard: KeyboardHandler) {}

  /**
   * Converte estados de teclas para um vetor de direção
   */
  getDirection(): { x: number; y: number } {
    const keys = this.keyboard.getState();
    return {
      x: (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0),
      y: (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0),
    };
  }

  /**
   * Mapeia teclas específicas para ações semânticas
   * TODO: Abstrair mapeamento para permitir configurações customizadas
   * para jogos diferentes
   */
  getActions(): { [key: string]: boolean } {
    const keys = this.keyboard.getState();
    return {
      fire: keys.Space,
      boost: keys.ShiftLeft || keys.ShiftRight,
    };
  }

  /**
   * O hook já atualiza automaticamente, então não há nada a fazer aqui
   */
  update(): void {
    // O hook useKeyboard atualiza automaticamente
  }
}
