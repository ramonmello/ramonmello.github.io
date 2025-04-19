import { getWebGLContext } from "./WebGLContext";
import { Ship } from "../entities/Ship";
import { ShipTrail } from "../entities/ShipTrail";
import { Projectile } from "../entities/Projectile";
import { Asteroid } from "../entities/Asteroid";
import { Explosion } from "../entities/Explosion";
import {
  checkCollision,
  checkProjectileAsteroidCollision,
} from "../utils/collisions";
import { useGameStore } from "../store/gameStore";
import type { InputSystem } from "./input/InputSystem";

// Interface para o objeto global com a flag de execução
const RUNNING_FLAG = "__engineRunning" as const;
interface GlobalWithEngineFlag {
  [RUNNING_FLAG]?: boolean;
}

// Tipos principais para o estado do jogo
interface GameState {
  ship: Ship;
  projectiles: Projectile[];
  asteroids: Asteroid[];
  explosions: Explosion[];
  prevSpace: boolean;
}

// Sistema de gestão do estado
const createGameState = (): GameState => {
  const { canvas } = getWebGLContext();
  return {
    ship: new Ship(canvas.width / 2, canvas.height / 2),
    projectiles: [],
    asteroids: Array.from({ length: 5 }, () => Asteroid.createOutsideCanvas()),
    explosions: [],
    prevSpace: false,
  };
};

// Variáveis de estado do motor
let gameState: GameState;
let rafId: number | null = null;

// Sistema de input
const handleInput = (state: GameState, inputSystem: InputSystem): GameState => {
  const newState = { ...state };

  // Obtém o estado de direção e ações
  const direction = inputSystem.getDirection();
  const actions = inputSystem.getActions();

  // Atualiza a nave com base na direção
  // Adaptação temporária até refatorarmos a classe Ship
  const shipInputAdapter = {
    getState: () => ({
      ArrowLeft: direction.x < 0,
      ArrowRight: direction.x > 0,
      ArrowUp: direction.y < 0,
      ArrowDown: direction.y > 0,
      Space: actions.fire,
    }),
  };

  newState.ship.update(shipInputAdapter);

  // Disparo único quando fire vai de false → true
  if (actions.fire && !newState.prevSpace) {
    const p = newState.ship.shoot();
    if (p) newState.projectiles.push(p);
  }
  newState.prevSpace = actions.fire;

  return newState;
};

// Sistema de atualização de entidades
const updateEntities = (state: GameState): GameState => {
  return {
    ...state,
    projectiles: state.projectiles.filter((p) => !p.update()),
    asteroids: state.asteroids.map((a) => {
      a.update();
      return a;
    }),
    explosions: state.explosions.filter((e) => !e.update()),
  };
};

// Sistema de colisões
const handleCollisions = (state: GameState): GameState => {
  const newState = { ...state };

  // Colisões nave × asteroide
  if (!newState.ship.isDestroyed) {
    for (const a of newState.asteroids) {
      if (checkCollision(newState.ship, a)) {
        newState.ship.destroy();
        newState.explosions.push(new Explosion(a.position.x, a.position.y));
        break;
      }
    }
  }

  // Colisões projétil × asteroide
  const projectilesToRemove = new Set<number>();
  const asteroidsToRemove = new Set<number>();
  const newExplosions: Explosion[] = [];
  const newAsteroids: Asteroid[] = [];

  newState.projectiles.forEach((p, pIndex) => {
    newState.asteroids.forEach((a, aIndex) => {
      if (
        !projectilesToRemove.has(pIndex) &&
        !asteroidsToRemove.has(aIndex) &&
        checkProjectileAsteroidCollision(p, a) &&
        !newState.ship.isDestroyed
      ) {
        projectilesToRemove.add(pIndex);
        asteroidsToRemove.add(aIndex);
        newExplosions.push(new Explosion(a.position.x, a.position.y));
        newAsteroids.push(
          Asteroid.createOutsideCanvas(),
          Asteroid.createOutsideCanvas()
        );
        const { incrementScore } = useGameStore.getState();
        incrementScore(1);
      }
    });
  });

  // Atualiza listas com base nas colisões
  newState.projectiles = newState.projectiles.filter(
    (_, i) => !projectilesToRemove.has(i)
  );
  newState.asteroids = [
    ...newState.asteroids.filter((_, i) => !asteroidsToRemove.has(i)),
    ...newAsteroids,
  ];
  newState.explosions = [...newState.explosions, ...newExplosions];

  // Verifica Game Over
  if (newState.ship.isDestroyed) {
    const { setGameOver } = useGameStore.getState();
    setGameOver(true);
  }

  return newState;
};

// Sistema de renderização
const renderGame = (state: GameState): void => {
  const { gl } = getWebGLContext();
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Renderiza rastro da nave
  state.ship.trailPositions.forEach((t, idx) => {
    const opacity = Math.max(0, 0.3 - idx / state.ship.trailPositions.length);
    new ShipTrail(t.x, t.y, t.rotation, opacity).draw();
  });

  // Renderiza entidades
  state.asteroids.forEach((a) => a.draw());
  if (!state.ship.isDestroyed) state.ship.draw();
  state.projectiles.forEach((p) => p.draw());
  state.explosions.forEach((e) => e.draw());
};

// Funções públicas para manter a compatibilidade com a API original
export async function startEngine(
  inputSystem: InputSystem
): Promise<() => void> {
  if ((globalThis as GlobalWithEngineFlag)[RUNNING_FLAG]) {
    return stopEngine;
  }
  (globalThis as GlobalWithEngineFlag)[RUNNING_FLAG] = true;

  // Inicializa o estado do jogo
  const { resetGameState } = useGameStore.getState();
  resetGameState();
  gameState = createGameState();

  // Loop principal do jogo
  function gameLoop() {
    // Atualiza estado do jogo
    gameState = handleInput(gameState, inputSystem);
    gameState = updateEntities(gameState);
    gameState = handleCollisions(gameState);

    // Renderiza o jogo
    renderGame(gameState);

    // Continua o loop
    rafId = requestAnimationFrame(gameLoop);
  }

  // Inicia o loop
  gameLoop();

  // Retorna função para parar o motor
  return stopEngine;
}

export function stopEngine() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  delete (globalThis as GlobalWithEngineFlag)[RUNNING_FLAG];
}

export function resetGame() {
  // Reseta estado global do score/game over
  const { resetGameState } = useGameStore.getState();
  resetGameState();

  // Reinicia o estado do jogo
  gameState = createGameState();
}
