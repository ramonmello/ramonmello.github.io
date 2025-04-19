import { Entity } from "./Entity";
import { System } from "./System";

/**
 * Gerenciador central do ECS que mantém entidades e sistemas.
 * Coordena a interação entre sistemas e entidades.
 */
export class World {
  /** Mapa de entidades por ID */
  private entities: Map<string, Entity> = new Map();

  /** Lista de sistemas ordenada por prioridade */
  private systems: System[] = [];

  /** Tempo acumulado desde o início */
  private elapsedTime: number = 0;

  /** Última vez que update foi chamado */
  private lastUpdateTime: number = 0;

  /**
   * Adiciona uma entidade ao mundo
   * @param entity Entidade a ser adicionada
   * @returns O próprio mundo para encadeamento
   */
  addEntity(entity: Entity): World {
    this.entities.set(entity.id, entity);
    return this;
  }

  /**
   * Remove uma entidade do mundo pelo ID
   * @param id ID da entidade a ser removida
   */
  removeEntity(id: string): void {
    this.entities.delete(id);
  }

  /**
   * Obtém uma entidade pelo ID
   * @param id ID da entidade a ser obtida
   * @returns A entidade se existir, undefined caso contrário
   */
  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * Retorna todas as entidades
   */
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

    // Ordena sistemas por prioridade
    this.systems.sort((a, b) => a.priority - b.priority);

    // Inicializa o sistema se tiver método init
    if (system.init) {
      system.init(this);
    }

    return this;
  }

  /**
   * Atualiza todos os sistemas ativos
   * @param deltaTime Tempo desde a última atualização em milissegundos
   */
  update(deltaTime: number): void {
    // Atualiza tempo acumulado
    this.elapsedTime += deltaTime;
    this.lastUpdateTime = performance.now();

    // Para cada sistema ativo
    for (const system of this.systems) {
      if (!system.enabled) continue;

      // Filtra entidades que o sistema deve processar
      const eligibleEntities = Array.from(this.entities.values()).filter(
        (entity) => system.shouldProcessEntity(entity)
      );

      // Atualiza o sistema com as entidades elegíveis
      system.update(eligibleEntities, deltaTime);
    }
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
    this.entities.clear();
    this.systems = [];
  }
}
