/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Engine.ts - Gerencia o loop principal do jogo e atualização de estado
 */

import { canvas, gl } from "./WebGLContext";
import { Ship, ShipTrail } from "../entities/Ship";
import { Projectile } from "../entities/Projectile";
import { Asteroid } from "../entities/Asteroid";
import { Explosion } from "../entities/Explosion";
import {
  checkCollision,
  checkProjectileAsteroidCollision,
} from "../utils/collisions";
import {
  spacePressed,
  resetSpacePressed,
  initInputControls,
} from "../utils/input";

// Estado do jogo
let ship: Ship;
let projectiles: Projectile[] = [];
let asteroids: Asteroid[] = [];
let explosions: Explosion[] = [];
let asteroidsDestroyed = 0;

// Controle do requestAnimationFrame
let rafId: number | null = null;

// Flag para indicar se o motor está em execução
const RUNNING_FLAG = "__engineRunning" as const;

// Atualiza o contador de asteroides destruídos na UI
function updateAsteroidCounter(): void {
  const counterElement = document.getElementById("asteroidCounter");
  if (counterElement) {
    counterElement.textContent = `Score: ${asteroidsDestroyed}`;
  }
}

// Mostra a mensagem de game over
function showGameOver(): void {
  const gameOverMessage = document.getElementById("gameOverMessage");
  if (gameOverMessage?.style) {
    if (gameOverMessage.style.display !== "block") {
      const gameOverScore = document.getElementById("gameOverScore");
      if (gameOverScore) {
        gameOverScore.textContent = `Score: ${asteroidsDestroyed}`;
      }
      gameOverMessage.style.display = "block";
    }
  }
}

// Atualiza o estado do jogo
function updateGame(): void {
  ship.update();

  if (spacePressed) {
    const newProjectile = ship.shoot();
    if (newProjectile) {
      projectiles.push(newProjectile);
    }
    resetSpacePressed();
  }

  projectiles = projectiles.filter((proj) => !proj.update());
  asteroids.forEach((asteroid) => asteroid.update());
  explosions = explosions.filter((explosion) => !explosion.update());

  if (!ship.isDestroyed) {
    for (const asteroid of asteroids) {
      if (checkCollision(ship, asteroid)) {
        const explosion = ship.destroy();
        if (explosion) {
          explosions.push(explosion);
        }
        break;
      }
    }
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    let projectileHit = false;

    for (let j = asteroids.length - 1; j >= 0; j--) {
      const asteroid = asteroids[j];

      if (
        checkProjectileAsteroidCollision(projectile, asteroid) &&
        !ship.isDestroyed
      ) {
        projectiles.splice(i, 1);
        projectileHit = true;

        explosions.push(
          new Explosion(asteroid.position.x, asteroid.position.y)
        );
        asteroids.splice(j, 1);
        asteroidsDestroyed++;
        updateAsteroidCounter();

        // Adiciona dois novos asteroides para aumentar a dificuldade
        asteroids.push(Asteroid.createOutsideCanvas());
        asteroids.push(Asteroid.createOutsideCanvas());

        break;
      }
    }

    if (projectileHit) break;
  }

  if (ship.isDestroyed) {
    showGameOver();
  }
}

// Renderiza o jogo
function renderGame(): void {
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Desenha o rastro da nave
  if (ship.trailPositions.length > 0) {
    ship.trailPositions.forEach((pos, index) => {
      const opacity = 0.3 - index / ship.trailPositions.length;
      const trail = new ShipTrail(pos.x, pos.y, pos.rotation, opacity);
      trail.draw();
    });
  }

  // Desenha todos os elementos do jogo
  asteroids.forEach((asteroid) => asteroid.draw());
  ship.draw();
  projectiles.forEach((proj) => proj.draw());
  explosions.forEach((explosion) => explosion.draw());
}

// Loop principal do jogo
function gameLoop(): void {
  updateGame();
  renderGame();
  rafId = requestAnimationFrame(gameLoop);
}

// Inicializa o jogo
function initGame(): void {
  // Inicializa controles de entrada
  initInputControls();

  // Cria a nave no centro da tela
  ship = new Ship(canvas.width / 2, canvas.height / 2);

  // Cria asteroides iniciais
  for (let i = 0; i < 5; i++) {
    asteroids.push(Asteroid.createOutsideCanvas());
  }

  updateAsteroidCounter();

  // Configura o botão para reiniciar o jogo
  const playAgainButton = document.getElementById("playAgainButton");
  if (playAgainButton) {
    playAgainButton.addEventListener("click", resetGame);
  }

  // Inicia o loop do jogo
  gameLoop();
}

// Reinicia o jogo após game over
export function resetGame(): void {
  const gameOverMessage = document.getElementById("gameOverMessage");
  if (gameOverMessage?.style) {
    gameOverMessage.style.display = "none";
  }

  asteroidsDestroyed = 0;
  updateAsteroidCounter();

  projectiles = [];
  asteroids = [];
  explosions = [];

  ship = new Ship(canvas.width / 2, canvas.height / 2);

  for (let i = 0; i < 5; i++) {
    asteroids.push(Asteroid.createOutsideCanvas());
  }
}

// Configuração do requestAnimationFrame para que possamos cancelá-lo depois
const _raf = globalThis.requestAnimationFrame.bind(globalThis);
globalThis.requestAnimationFrame = function (cb: FrameRequestCallback): number {
  const id = _raf(cb);
  rafId = id;
  return id;
} as typeof requestAnimationFrame;

// Inicia o motor do jogo
export async function startEngine(): Promise<() => void> {
  // Se já estivermos rodando, não reinicie
  if ((globalThis as any)[RUNNING_FLAG]) {
    return stopEngine;
  }
  (globalThis as any)[RUNNING_FLAG] = true;

  try {
    initGame();
  } catch (error) {
    console.error("Failed to launch the game: ", error);
  }

  // Devolve cleaner para React desmontar
  return stopEngine;
}

// Para o motor do jogo
export function stopEngine(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  delete (globalThis as any)[RUNNING_FLAG];
}
