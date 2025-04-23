import { Entity } from "@/engine/core/ecs/base/Entity";
import { TransformComponent } from "@/engine/core/ecs/components/TransformComponent";
import { RenderComponent } from "@/engine/core/ecs/components/RenderComponent";
import { PhysicsComponent } from "@/engine/core/ecs/components/PhysicsComponent";
import { ColliderComponent } from "@/engine/core/ecs/components/ColliderComponent";
import {
  AsteroidComponent,
  AsteroidSize,
} from "../components/AsteroidComponent";
import { getWebGLContext } from "../../../../core/rendering/WebGLContext";

/**
 * Cria uma entidade de asteroide
 * @param size Tamanho do asteroide (large, medium, small)
 * @param position Posição inicial opcional
 * @returns Entidade do asteroide
 */
export function createAsteroidEntity(
  size: AsteroidSize | "large" | "medium" | "small" = AsteroidSize.Large,
  position?: { x: number; y: number }
): Entity {
  // Converte string para enum se necessário
  let asteroidSize: AsteroidSize;
  if (typeof size === "string") {
    switch (size) {
      case "large":
        asteroidSize = AsteroidSize.Large;
        break;
      case "medium":
        asteroidSize = AsteroidSize.Medium;
        break;
      case "small":
        asteroidSize = AsteroidSize.Small;
        break;
      default:
        asteroidSize = AsteroidSize.Large;
    }
  } else {
    asteroidSize = size;
  }

  // Determina o raio com base no tamanho
  let radius: number;
  switch (asteroidSize) {
    case AsteroidSize.Large:
      radius = 40;
      break;
    case AsteroidSize.Medium:
      radius = 20;
      break;
    case AsteroidSize.Small:
      radius = 10;
      break;
    default:
      radius = 40;
  }

  // Cria a entidade
  const asteroid = new Entity("asteroid");

  // Determina a posição inicial se não for fornecida
  const { canvas } = getWebGLContext();
  let x, y;

  if (position) {
    x = position.x;
    y = position.y;
  } else {
    // Posição aleatória fora da tela
    const side = Math.floor(Math.random() * 4);

    switch (side) {
      case 0: // Topo
        x = Math.random() * canvas.width;
        y = -radius * 2;
        break;
      case 1: // Direita
        x = canvas.width + radius * 2;
        y = Math.random() * canvas.height;
        break;
      case 2: // Baixo
        x = Math.random() * canvas.width;
        y = canvas.height + radius * 2;
        break;
      case 3: // Esquerda
        x = -radius * 2;
        y = Math.random() * canvas.height;
        break;
      default:
        x = Math.random() * canvas.width;
        y = -radius * 2;
    }
  }

  // Componente de transformação
  const transform = new TransformComponent(
    x,
    y,
    Math.random() * Math.PI * 2 // Rotação aleatória
  );

  // Cria vértices para um asteroide irregular
  const vertices = createAsteroidVertices(radius);

  // Componente de renderização
  const render = new RenderComponent(vertices);
  render.setColor(0.7, 0.7, 0.7, 1);

  // Componente de física - velocidade e rotação aleatórias
  const physics = new PhysicsComponent(1.0); // Sem fricção

  // Velocidade baseada no tamanho (menor = mais rápido)
  const speedFactor = 1 + (2 - asteroidSize) * 0.5;
  physics.setVelocity(
    (Math.random() - 0.5) * 2 * speedFactor,
    (Math.random() - 0.5) * 2 * speedFactor
  );

  physics.setAngularVelocity((Math.random() - 0.5) * 0.05);

  // Componente de colisão
  const collider = ColliderComponent.createCircle(radius * 0.8); // Colisor um pouco menor que o visual

  // Componente específico de asteroide
  const asteroidComponent = new AsteroidComponent(asteroidSize);

  // Adiciona todos os componentes
  asteroid
    .addComponent(transform)
    .addComponent(render)
    .addComponent(physics)
    .addComponent(collider)
    .addComponent(asteroidComponent);

  return asteroid;
}

/**
 * Cria vértices para um asteroide com formato irregular
 * @param radius Raio base do asteroide
 * @returns Array de vértices
 */
function createAsteroidVertices(radius: number): Float32Array {
  // Número de pontos do polígono
  const numPoints = 10 + Math.floor(Math.random() * 6);

  // Aloca espaço para os triângulos (centro + dois pontos do perímetro)
  // Cada triângulo tem 3 pontos, cada ponto tem 2 coordenadas (x,y)
  const vertices = new Float32Array(numPoints * 3 * 2);

  // Centro do asteroide
  const centerX = 0;
  const centerY = 0;

  // Cria pontos com distâncias variáveis do centro
  for (let i = 0; i < numPoints; i++) {
    // Ângulo atual e próximo
    const angle = (i / numPoints) * Math.PI * 2;
    const nextAngle = ((i + 1) / numPoints) * Math.PI * 2;

    // Variação no raio para tornar o asteroide irregular
    const radiusVariation1 = radius * (0.8 + Math.random() * 0.4);
    const radiusVariation2 = radius * (0.8 + Math.random() * 0.4);

    // Centro do asteroide para cada triângulo
    vertices[i * 6] = centerX;
    vertices[i * 6 + 1] = centerY;

    // Primeiro ponto na borda
    vertices[i * 6 + 2] = Math.cos(angle) * radiusVariation1;
    vertices[i * 6 + 3] = Math.sin(angle) * radiusVariation1;

    // Segundo ponto na borda
    vertices[i * 6 + 4] = Math.cos(nextAngle) * radiusVariation2;
    vertices[i * 6 + 5] = Math.sin(nextAngle) * radiusVariation2;
  }

  return vertices;
}
