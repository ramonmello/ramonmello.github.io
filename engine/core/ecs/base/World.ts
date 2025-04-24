import { Entity } from "./Entity";
import { System } from "./System";
import {
  MessageBus,
  MessageData,
  MessageHandler,
} from "@/engine/core/messaging/MessageBus";

export class World {
  private entities: Map<string, Entity> = new Map();

  private systems: System[] = [];

  private elapsedTime: number = 0;

  private lastUpdateTime: number = 0;

  private messageDisposers: Array<() => void> = [];

  private running: boolean = false;

  /**
   * Adiciona uma entidade ao mundo
   * @param entity Entidade a ser adicionada
   * @returns O próprio mundo para encadeamento
   */
  addEntity(entity: Entity): World {
    this.entities.set(entity.id, entity);
    this.emit("entityAdded", { entity });
    return this;
  }

  /**
   * Remove uma entidade do mundo pelo ID
   * @param id ID da entidade a ser removida
   */
  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.destroy();
      this.entities.delete(id);
      this.emit("entityRemoved", { entityId: id });
    }
  }

  /**
   * Obtém uma entidade pelo ID
   * @param id ID da entidade a ser obtida
   * @returns A entidade se existir, undefined caso contrário
   */
  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Adiciona um sistema ao mundo
   * @param system Sistema a ser adicionado
   * @returns O próprio mundo para encadeamento
   */
  addSystem(system: System): World {
    system.setWorld(this);
    this.systems.push(system);

    this.systems.sort((a, b) => a.priority - b.priority);

    if (system.init) {
      system.init(this);
    }

    return this;
  }

  /**
   * Emite uma mensagem para todo o sistema
   * @param messageType Tipo da mensagem a emitir
   * @param data Dados adicionais a serem enviados com a mensagem
   */
  emit(messageType: string, data: MessageData = {}): void {
    MessageBus.getInstance().emit(messageType, {
      world: this,
      ...data,
    });
  }

  /**
   * Registra um listener para um tipo de mensagem
   * @param messageType Tipo da mensagem a ouvir
   * @param handler Função a ser chamada quando a mensagem for emitida
   * @returns O próprio mundo para encadeamento
   */
  on(messageType: string, handler: MessageHandler): World {
    const disposer = MessageBus.getInstance().on(messageType, handler);
    this.messageDisposers.push(disposer);
    return this;
  }

  clearAllListeners(): void {
    this.messageDisposers.forEach((disposer) => disposer());
    this.messageDisposers = [];
  }

  start(): void {
    if (!this.running) {
      this.running = true;
      this.emit("worldStarted", {});
    }
  }

  stop(): void {
    if (this.running) {
      this.running = false;
      this.emit("worldStopped", {});
    }
  }

  /**
   * Atualiza todos os sistemas ativos
   * @param deltaTime Tempo desde a última atualização em milissegundos
   */
  update(deltaTime: number): void {
    if (!this.running) return;

    this.elapsedTime += deltaTime;
    this.lastUpdateTime = performance.now();

    this.emit("preUpdate", { deltaTime });

    for (const system of this.systems) {
      if (!system.enabled) continue;

      const eligibleEntities = Array.from(this.entities.values()).filter(
        (entity) => system.shouldProcessEntity(entity)
      );

      system.update(eligibleEntities, deltaTime);
    }

    this.emit("postUpdate", { deltaTime });
  }

  /**
   * Retorna entidades que possuem todos os componentes especificados
   * @param componentTypes Tipos de componentes que as entidades devem ter
   */
  getEntitiesWith(...componentTypes: string[]): Entity[] {
    return Array.from(this.entities.values()).filter((entity) =>
      componentTypes.every((type) => entity.hasComponent(type))
    );
  }

  /**
   * Retorna o tempo total acumulado desde o início
   */
  getElapsedTime(): number {
    return this.elapsedTime;
  }

  /**
   * Limpa todas as entidades e sistemas
   */
  clear(): void {
    this.entities.forEach((entity) => entity.destroy());
    this.entities.clear();

    this.systems = [];

    this.clearAllListeners();

    this.elapsedTime = 0;
    this.lastUpdateTime = 0;

    this.emit("worldCleared", {});
  }

  /**
   * Destrói o mundo e libera recursos
   */
  destroy(): void {
    this.stop();
    this.clear();
    this.emit("worldDestroyed", {});
    MessageBus.getInstance().clearAllListeners();
  }
}
