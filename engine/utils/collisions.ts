// src/engine/utils/collisions.ts

/**
 * Utilitários de colisão para o jogo.
 */

/** Vetor 2D genérico */
export interface Vec2 {
  x: number;
  y: number;
}

/**
 * Verifica colisão entre a nave e um asteroide.
 * - Ship agora expõe `pos: Vec2`
 * - Asteroid expõe `position: Vec2` e `size: number`
 */
export function checkCollision(
  ship: { pos: Vec2 },
  asteroid: { position: Vec2; size: number }
): boolean {
  const dx = ship.pos.x - asteroid.position.x;
  const dy = ship.pos.y - asteroid.position.y;
  const distance = Math.hypot(dx, dy);
  const shipRadius = 15;
  return distance < shipRadius + asteroid.size;
}

/**
 * Verifica colisão entre um projétil e um asteroide.
 * - Projectile agora expõe `pos: Vec2`
 * - Asteroid expõe `position: Vec2` e `size: number`
 */
export function checkProjectileAsteroidCollision(
  projectile: { pos: Vec2 },
  asteroid: { position: Vec2; size: number }
): boolean {
  const dx = projectile.pos.x - asteroid.position.x;
  const dy = projectile.pos.y - asteroid.position.y;
  const distance = Math.hypot(dx, dy);
  const projectileRadius = 1;
  return distance < projectileRadius + asteroid.size;
}
