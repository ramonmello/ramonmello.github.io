/**
 * collisions.ts - Funções para detectar colisões entre entidades
 */

import { Ship } from "../entities/Ship";
import { Asteroid } from "../entities/Asteroid";
import { Projectile } from "../entities/Projectile";

// Verifica colisão entre nave e asteroide
export function checkCollision(ship: Ship, asteroid: Asteroid): boolean {
  const dx = ship.position.x - asteroid.position.x;
  const dy = ship.position.y - asteroid.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const shipRadius = 15;
  return distance < shipRadius + asteroid.size;
}

// Verifica colisão entre projétil e asteroide
export function checkProjectileAsteroidCollision(
  projectile: Projectile,
  asteroid: Asteroid
): boolean {
  const dx = projectile.position.x - asteroid.position.x;
  const dy = projectile.position.y - asteroid.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const projectileRadius = 1;
  return distance < projectileRadius + asteroid.size;
}
