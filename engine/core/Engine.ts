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

// Importa o handler genérico de teclado criado em Phase 1
import type { KeyboardHandler } from "@/hooks/useKeyboard";

// estado do jogo
let ship: Ship;
let projectiles: Projectile[] = [];
let asteroids: Asteroid[] = [];
let explosions: Explosion[] = [];

// requestAnimationFrame
let rafId: number | null = null;

// Flag para singleton
const RUNNING_FLAG = "__engineRunning" as const;

// Interface para o objeto global com a flag de execução
interface GlobalWithEngineFlag {
  [RUNNING_FLAG]?: boolean;
}

export async function startEngine(
  keyboard: KeyboardHandler
): Promise<() => void> {
  if ((globalThis as GlobalWithEngineFlag)[RUNNING_FLAG]) {
    return stopEngine;
  }
  (globalThis as GlobalWithEngineFlag)[RUNNING_FLAG] = true;

  // Reseta estado global do score/game over
  const { resetGameState } = useGameStore.getState();
  resetGameState();

  // --- Inicializa entidades ---
  const { canvas } = getWebGLContext();
  ship = new Ship(canvas.width / 2, canvas.height / 2);
  asteroids = [];
  projectiles = [];
  explosions = [];
  for (let i = 0; i < 5; i++) {
    asteroids.push(Asteroid.createOutsideCanvas());
  }

  // Variável para detectar o "rising edge" da tecla Space
  let prevSpace = false;

  // Lógica de update (sem listeners globais)
  function updateGame() {
    // Passa o objeto de teclado para o método update da nave
    ship.update(keyboard);

    // Pulo único: dispara apenas quando Space vai de false → true
    const keys = keyboard.getState();
    if (keys.Space && !prevSpace) {
      const p = ship.shoot();
      if (p) projectiles.push(p);
    }
    prevSpace = keys.Space;

    // Atualiza demais entidades
    projectiles = projectiles.filter((p) => !p.update());
    asteroids.forEach((a) => a.update());
    explosions = explosions.filter((e) => !e.update());

    // Colisões nave × asteroide
    if (!ship.isDestroyed) {
      for (const a of asteroids) {
        if (checkCollision(ship, a)) {
          ship.destroy();
          explosions.push(new Explosion(a.position.x, a.position.y));
          break;
        }
      }
    }

    // Colisões projétil × asteroide
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      for (let j = asteroids.length - 1; j >= 0; j--) {
        const a = asteroids[j];
        if (checkProjectileAsteroidCollision(p, a) && !ship.isDestroyed) {
          projectiles.splice(i, 1);
          explosions.push(new Explosion(a.position.x, a.position.y));
          asteroids.splice(j, 1);
          const { incrementScore } = useGameStore.getState();
          incrementScore(1);
          asteroids.push(Asteroid.createOutsideCanvas());
          asteroids.push(Asteroid.createOutsideCanvas());
          break;
        }
      }
    }

    // Game Over
    if (ship.isDestroyed) {
      const { setGameOver } = useGameStore.getState();
      setGameOver(true);
    }
  }

  // Renderização permanece inalterada
  function renderGame() {
    const { gl } = getWebGLContext();
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    ship.trailPositions.forEach((t, idx) => {
      const opacity = Math.max(0, 0.3 - idx / ship.trailPositions.length);
      new ShipTrail(t.x, t.y, t.rotation, opacity).draw();
    });

    asteroids.forEach((a) => a.draw());
    if (!ship.isDestroyed) ship.draw();
    projectiles.forEach((p) => p.draw());
    explosions.forEach((e) => e.draw());
  }

  // Loop principal
  function gameLoop() {
    updateGame();
    renderGame();
    rafId = requestAnimationFrame(gameLoop);
  }
  gameLoop();

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

  // --- Inicializa entidades ---
  const { canvas } = getWebGLContext();
  ship = new Ship(canvas.width / 2, canvas.height / 2);
  asteroids = [];
  projectiles = [];
  explosions = [];
  for (let i = 0; i < 5; i++) {
    asteroids.push(Asteroid.createOutsideCanvas());
  }
}
