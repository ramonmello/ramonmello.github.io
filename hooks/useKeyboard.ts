import { useEffect, useRef } from "react";

// Representa o estado de teclas pressionadas: código da tecla → true/false
export type KeyState = { [key: string]: boolean };

// Interface que o hook retorna, para obter o estado atual
export interface KeyboardHandler {
  getState(): KeyState;
}

/**
 * useKeyboard
 * Hook para gerenciar estado de teclado de forma reativa e isolada.
 * Adiciona listeners de keydown, keyup e blur, mantendo um ref interno
 * com o estado de cada tecla. Garante cleanup automático no React.
 *
 * Uso:
 * const keyboard = useKeyboard();
 * // Dentro do loop da engine:
 * const keys = keyboard.getState();
 * if (keys.ArrowUp) { ... }
 */
export function useKeyboard(): KeyboardHandler {
  const keysRef = useRef<KeyState>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    const handleBlur = () => {
      // Limpa todas as teclas ao perder foco (evita stuck keys)
      keysRef.current = {};
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const getState = (): KeyState => {
    // Retorna cópia para assegurar imutabilidade externa
    return { ...keysRef.current };
  };

  return { getState };
}
