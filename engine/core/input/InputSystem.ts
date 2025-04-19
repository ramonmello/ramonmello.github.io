/**
 * Interface que define o contrato para sistemas de input.
 * Permite abstração sobre diferentes formas de entrada (teclado, mouse, etc.)
 */
export interface InputSystem {
  /**
   * Retorna a direção indicada pelo input como vetor 2D
   * x: -1 (esquerda) a 1 (direita)
   * y: -1 (cima) a 1 (baixo)
   */
  getDirection(): { x: number; y: number };

  /**
   * Retorna um mapa de ações booleanas ativas
   * Ex: { fire: true, boost: false }
   */
  getActions(): { [key: string]: boolean };

  /**
   * Atualiza o estado do sistema de input, se necessário
   */
  update(): void;
}
