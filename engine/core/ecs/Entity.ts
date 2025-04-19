import { Component } from "./Component";

/**
 * Representa uma entidade no sistema ECS.
 * Uma entidade é um container de componentes que define um objeto no jogo.
 */
export class Entity {
  /** Identificador único da entidade */
  id: string;

  /** Mapa de componentes anexados à entidade */
  components: Map<string, Component>;

  /** Nome opcional da entidade para depuração */
  name?: string;

  /**
   * Cria uma nova entidade
   * @param id Opcional, ID personalizado ou gerado automaticamente
   * @param name Opcional, nome para depuração
   */
  constructor(id?: string, name?: string) {
    this.id = id || crypto.randomUUID();
    this.components = new Map();
    this.name = name;
  }

  /**
   * Adiciona um componente à entidade
   * @param component Componente a ser adicionado
   * @returns A própria entidade para encadeamento
   */
  addComponent(component: Component): Entity {
    component.entity = this;
    this.components.set(component.type, component);
    return this;
  }

  /**
   * Obtém um componente da entidade pelo tipo
   * @param type Tipo do componente a ser obtido
   * @returns O componente se existir, undefined caso contrário
   */
  getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T;
  }

  /**
   * Verifica se a entidade possui um determinado componente
   * @param type Tipo do componente a verificar
   * @returns true se o componente existir, false caso contrário
   */
  hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * Remove um componente da entidade
   * @param type Tipo do componente a remover
   * @returns true se o componente foi removido, false se não existia
   */
  removeComponent(type: string): boolean {
    const component = this.components.get(type);
    if (component) {
      component.entity = undefined;
      return this.components.delete(type);
    }
    return false;
  }
}
