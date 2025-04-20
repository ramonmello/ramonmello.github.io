import { Entity } from "./Entity";

/**
 * Classe base para todos os componentes no sistema ECS.
 * Um componente representa um conjunto de dados ou estado.
 */
export abstract class Component {
  /**
   * Referência para a entidade à qual este componente pertence
   */
  entity?: Entity;

  /**
   * Tipo do componente, usado para identificação.
   * Deve ser único por tipo de componente.
   */
  abstract get type(): string;

  /**
   * Inicializa o componente
   */
  constructor() {}

  /**
   * Método opcional que pode ser implementado pelos componentes
   * para realizar sua própria inicialização quando adicionados a uma entidade
   */
  onAttach?(): void;

  /**
   * Método opcional que pode ser implementado pelos componentes
   * para realizar limpeza quando removidos de uma entidade
   */
  onDetach?(): void;
}
