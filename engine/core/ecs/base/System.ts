import { Entity } from "./Entity";
import { World } from "@/engine/core/ecs/base/World";

/**
 * Classe base para todos os sistemas no ECS.
 * Um sistema processa entidades que possuem um conjunto específico de componentes.
 */
export abstract class System {
  /**
   * Lista de tipos de componentes que uma entidade deve ter
   * para ser processada por este sistema
   */
  abstract readonly componentTypes: string[];

  /**
   * Referência para o mundo ao qual este sistema pertence
   */
  protected world?: World;

  /**
   * Ordem de execução do sistema no ciclo de atualização
   * Sistemas com valor menor são executados primeiro
   */
  priority: number = 0;

  /**
   * Determina se o sistema está ativo
   */
  enabled: boolean = true;

  /**
   * Define o mundo ao qual este sistema pertence
   */
  setWorld(world: World): void {
    this.world = world;
  }

  /**
   * Verifica se uma entidade possui todos os componentes
   * necessários para ser processada por este sistema
   */
  shouldProcessEntity(entity: Entity): boolean {
    return this.componentTypes.every((type) => entity.hasComponent(type));
  }

  /**
   * Método de inicialização chamado quando o sistema é adicionado ao mundo
   */
  init?(world: World): void;

  /**
   * Processa todas as entidades elegíveis
   * @param entities Lista de entidades a serem processadas
   * @param deltaTime Tempo desde a última atualização
   */
  abstract update(entities: Entity[], deltaTime: number): void;
}
