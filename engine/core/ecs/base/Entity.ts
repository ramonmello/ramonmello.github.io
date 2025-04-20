import { Component } from "@/engine/core/ecs/base/Component";
import {
  MessageBus,
  MessageData,
  MessageHandler,
} from "@/engine/core/messaging/MessageBus";

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

  /** Lista de disposers para limpar listeners de mensagens */
  private messageDisposers: Array<() => void> = [];

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

    // Chama o método onAttach se existir
    if (component.onAttach) {
      component.onAttach();
    }

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
      // Chama o método onDetach se existir
      if (component.onDetach) {
        component.onDetach();
      }

      component.entity = undefined;
      return this.components.delete(type);
    }
    return false;
  }

  /**
   * Emite uma mensagem para todo o sistema
   * @param messageType Tipo da mensagem a emitir
   * @param data Dados adicionais a serem enviados com a mensagem
   */
  emit(messageType: string, data: MessageData = {}): void {
    MessageBus.getInstance().emit(messageType, {
      entity: this,
      entityId: this.id,
      entityName: this.name,
      ...data,
    });
  }

  /**
   * Registra um listener para um tipo de mensagem
   * @param messageType Tipo da mensagem a ouvir
   * @param handler Função a ser chamada quando a mensagem for emitida
   * @returns A própria entidade para encadeamento
   */
  on(messageType: string, handler: MessageHandler): Entity {
    const disposer = MessageBus.getInstance().on(messageType, handler);
    this.messageDisposers.push(disposer);
    return this;
  }

  /**
   * Remove todos os listeners de mensagens registrados por esta entidade
   */
  clearAllListeners(): void {
    this.messageDisposers.forEach((disposer) => disposer());
    this.messageDisposers = [];
  }

  /**
   * Destrói a entidade, desanexando componentes e limpando recursos
   */
  destroy(): void {
    // Remove todos os componentes e chama seus métodos onDetach
    Array.from(this.components.keys()).forEach((type) => {
      this.removeComponent(type);
    });

    // Remove todos os listeners de mensagens
    this.clearAllListeners();
  }
}
