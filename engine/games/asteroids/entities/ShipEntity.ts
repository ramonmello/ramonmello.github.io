import { Entity } from "@/engine/core/ecs/base/Entity";
import { TransformComponent } from "@/engine/core/ecs/components/TransformComponent";
import { RenderComponent } from "@/engine/core/ecs/components/RenderComponent";
import { PhysicsComponent } from "@/engine/core/ecs/components/PhysicsComponent";
import { ColliderComponent } from "@/engine/core/ecs/components/ColliderComponent";
import { ShipComponent } from "../components/ShipComponent";
import { getWebGLContext } from "@/engine/core/rendering/WebGLContext";

/**
 * Cria uma entidade para a nave do jogador
 * @param config Configuração do jogo
 * @returns Entidade da nave do jogador
 */
export function createShipEntity(): Entity {
  const { canvas } = getWebGLContext();

  // Cria a entidade com ID e nome
  const ship = new Entity("player_ship", "Player Ship");

  // Componente de transformação - posiciona no centro da tela
  const transform = new TransformComponent(
    canvas.width / 2,
    canvas.height / 2,
    0 // Apontando para cima
  );

  // Vertices para a forma da nave (triângulo)
  // Dimensões: base = 15, altura = 37.5
  const shipVertices = new Float32Array([0, 22.5, -7.5, -15, 7.5, -15]);

  // Componente de renderização
  const render = new RenderComponent(shipVertices);
  render.setColor(1, 1, 1, 1); // Branco

  // Componente de física
  const physics = new PhysicsComponent(0.98, true, 1, 10);

  // Componente de colisão
  const collider = ColliderComponent.createCircle(12);

  // Componente específico do jogador
  const player = new ShipComponent(10, 0.2, 0.1);

  // Adiciona todos os componentes à entidade
  ship
    .addComponent(transform)
    .addComponent(render)
    .addComponent(physics)
    .addComponent(collider)
    .addComponent(player);

  return ship;
}

/**
 * Cria o efeito de propulsão (rastro) para a nave
 * @param shipEntity Entidade da nave
 * @returns Entidade do rastro
 */
export function createThrustEntity(shipEntity: Entity): Entity {
  // Obtem o componente de transformação da nave
  const shipTransform = shipEntity.getComponent<TransformComponent>(
    TransformComponent.TYPE
  );

  if (!shipTransform) {
    throw new Error("Ship entity missing TransformComponent");
  }

  // Cria a entidade do rastro
  const thrust = new Entity("ship_thrust", "Ship Thrust Effect");

  // Posiciona na parte traseira da nave
  const transform = new TransformComponent(
    shipTransform.position.x,
    shipTransform.position.y,
    shipTransform.rotation
  );

  // Vertices para o efeito de propulsão (pequeno triângulo)
  const thrustVertices = new Float32Array([
    0,
    12, // Base (parte de trás da nave)
    -4,
    18, // Ponta esquerda
    4,
    18, // Ponta direita
  ]);

  // Componente de renderização
  const render = new RenderComponent(thrustVertices);
  render.setColor(1, 0.7, 0.2, 0.8); // Laranja/amarelo com transparência

  // Adiciona componentes
  thrust.addComponent(transform).addComponent(render);

  return thrust;
}
