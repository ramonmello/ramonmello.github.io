/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Engine.ts — gerencia o loop do jogo, update e render
 */

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
import {
  attachInputControls,
  detachInputControls,
  consumeSpacePressed,
} from "../utils/input";

// estado do jogo
let ship: Ship;
let projectiles: Projectile[] = [];
let asteroids: Asteroid[] = [];
let explosions: Explosion[] = [];
let asteroidsDestroyed = 0;

// requestAnimationFrame
let rafId: number | null = null;

// Flag para singleton
const RUNNING_FLAG = "__engineRunning" as const;

// atualiza o contador no HUD
function updateAsteroidCounter() {
  const el = document.getElementById("asteroidCounter");
  if (el) el.textContent = `Score: ${asteroidsDestroyed}`;
}

// exibe overlay de Game Over
function showGameOver() {
  const el = document.getElementById("gameOverMessage");
  if (!el || el.style.display === "block") return;
  const scoreEl = document.getElementById("gameOverScore");
  if (scoreEl) scoreEl.textContent = `Score: ${asteroidsDestroyed}`;
  el.style.display = "block";
}

// realiza lógica de update a cada frame
function updateGame() {
  ship.update();

  // tiro único por pulso
  if (consumeSpacePressed()) {
    const p = ship.shoot();
    if (p) projectiles.push(p);
  }

  projectiles = projectiles.filter((p) => !p.update());
  asteroids.forEach((a) => a.update());
  explosions = explosions.filter((e) => !e.update());

  if (!ship.isDestroyed) {
    for (const a of asteroids) {
      if (checkCollision(ship, a)) {
        ship.destroy();
        explosions.push(new Explosion(a.position.x, a.position.y));
        break;
      }
    }
  }

  // colisões projétil x asteroide
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const a = asteroids[j];
      if (checkProjectileAsteroidCollision(p, a) && !ship.isDestroyed) {
        projectiles.splice(i, 1);
        explosions.push(new Explosion(a.position.x, a.position.y));
        asteroids.splice(j, 1);
        asteroidsDestroyed++;
        updateAsteroidCounter();
        asteroids.push(Asteroid.createOutsideCanvas());
        asteroids.push(Asteroid.createOutsideCanvas());
        break;
      }
    }
  }

  if (ship.isDestroyed) {
    showGameOver();
  }
}

// renderiza a cena
function renderGame() {
  const { gl } = getWebGLContext();
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // rastro
  ship.trailPositions.forEach((t, idx) => {
    const opacity = Math.max(0, 0.3 - idx / ship.trailPositions.length);
    new ShipTrail(t.x, t.y, t.rotation, opacity).draw();
  });

  // desenha
  asteroids.forEach((a) => a.draw());
  if (!ship.isDestroyed) {
    ship.draw();
  }
  projectiles.forEach((p) => p.draw());
  explosions.forEach((e) => e.draw());
}

// loop recursivo
function gameLoop() {
  updateGame();
  renderGame();
  rafId = requestAnimationFrame(gameLoop);
}

// inicializa entidades e listeners (contexto já existe)
function initGame() {
  const { canvas } = getWebGLContext();

  ship = new Ship(canvas.width / 2, canvas.height / 2);
  for (let i = 0; i < 5; i++) {
    asteroids.push(Asteroid.createOutsideCanvas());
  }
  updateAsteroidCounter();

  // reinicia via botão
  document
    .getElementById("playAgainButton")
    ?.addEventListener("click", resetGame);

  gameLoop();
}

// reinicia após Game Over
export function resetGame() {
  document.getElementById("gameOverMessage")!.style.display = "none";
  asteroidsDestroyed = 0;
  updateAsteroidCounter();
  projectiles = [];
  asteroids = [];
  explosions = [];
  const { canvas } = getWebGLContext();
  ship = new Ship(canvas.width / 2, canvas.height / 2);
  for (let i = 0; i < 5; i++) {
    asteroids.push(Asteroid.createOutsideCanvas());
  }
}

// override de requestAnimationFrame para capturar rafId
const _raf = globalThis.requestAnimationFrame.bind(globalThis);
const overrideRaf: typeof requestAnimationFrame = (
  cb: FrameRequestCallback
): number => {
  const id = _raf(cb);
  rafId = id;
  return id;
};
globalThis.requestAnimationFrame = overrideRaf;

// inicia o engine
export async function startEngine(): Promise<() => void> {
  if ((globalThis as any)[RUNNING_FLAG]) return stopEngine;
  (globalThis as any)[RUNNING_FLAG] = true;

  // anexa input e inicia o jogo
  attachInputControls();
  initGame();

  return stopEngine;
}

// para o engine
export function stopEngine() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  delete (globalThis as any)[RUNNING_FLAG];

  // remove listeners
  detachInputControls();
}
