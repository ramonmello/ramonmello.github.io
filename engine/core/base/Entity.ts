import { Component } from "@/engine/core/base/Component";
import {
  MessageBus,
  MessageData,
  MessageHandler,
} from "@/engine/core/messaging/MessageBus";

export class Entity {
  id: string;

  components: Map<string, Component>;

  name?: string;

  private messageDisposers: Array<() => void> = [];

  constructor(id?: string, name?: string) {
    this.id = id || crypto.randomUUID();
    this.components = new Map();
    this.name = name;
  }

  addComponent(component: Component): Entity {
    component.entity = this;
    this.components.set(component.type, component);

    if (component.onAttach) {
      component.onAttach();
    }

    return this;
  }

  getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T;
  }

  hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  removeComponent(type: string): boolean {
    const component = this.components.get(type);
    if (component) {
      if (component.onDetach) {
        component.onDetach();
      }

      component.entity = undefined;
      return this.components.delete(type);
    }
    return false;
  }

  emit(messageType: string, data: MessageData = {}): void {
    MessageBus.getInstance().emit(messageType, {
      entity: this,
      entityId: this.id,
      entityName: this.name,
      ...data,
    });
  }

  on(messageType: string, handler: MessageHandler): Entity {
    const disposer = MessageBus.getInstance().on(messageType, handler);
    this.messageDisposers.push(disposer);
    return this;
  }

  clearAllListeners(): void {
    this.messageDisposers.forEach((disposer) => disposer());
    this.messageDisposers = [];
  }

  destroy(): void {
    Array.from(this.components.keys()).forEach((type) => {
      this.removeComponent(type);
    });

    this.clearAllListeners();
  }
}
