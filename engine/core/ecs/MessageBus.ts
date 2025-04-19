/**
 * Tipo para os dados passados com uma mensagem
 */
export type MessageData = Record<string, unknown>;

/**
 * Função manipuladora de mensagens
 */
export type MessageHandler = (data: MessageData) => void;

/**
 * Sistema de mensagens que implementa o padrão Observer
 * Permite comunicação desacoplada entre partes do sistema
 */
export class MessageBus {
  private static instance: MessageBus;
  private listeners: Map<string, Set<MessageHandler>> = new Map();

  /**
   * Obtém a instância singleton do MessageBus
   */
  static getInstance(): MessageBus {
    if (!MessageBus.instance) {
      MessageBus.instance = new MessageBus();
    }
    return MessageBus.instance;
  }

  /**
   * Construtor privado para o singleton
   */
  private constructor() {}

  /**
   * Registra um ouvinte para um tipo de mensagem
   * @param messageType Tipo da mensagem para ouvir
   * @param handler Função a ser chamada quando a mensagem for emitida
   * @returns Função para remover o ouvinte
   */
  on(messageType: string, handler: MessageHandler): () => void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set());
    }

    this.listeners.get(messageType)!.add(handler);

    // Retorna uma função para remover o listener
    return () => {
      const handlers = this.listeners.get(messageType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(messageType);
        }
      }
    };
  }

  /**
   * Emite uma mensagem para todos os ouvintes registrados
   * @param messageType Tipo da mensagem
   * @param data Dados associados à mensagem
   */
  emit(messageType: string, data: MessageData = {}): void {
    const handlers = this.listeners.get(messageType);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Remove todos os ouvintes para um tipo de mensagem
   * @param messageType Tipo da mensagem
   */
  clearListeners(messageType: string): void {
    this.listeners.delete(messageType);
  }

  /**
   * Remove todos os ouvintes
   */
  clearAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * Verifica se há ouvintes para um tipo de mensagem
   * @param messageType Tipo da mensagem
   */
  hasListeners(messageType: string): boolean {
    return (
      this.listeners.has(messageType) &&
      this.listeners.get(messageType)!.size > 0
    );
  }
}
