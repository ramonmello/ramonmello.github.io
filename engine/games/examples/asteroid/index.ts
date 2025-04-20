import { AsteroidGame } from "./AsteroidGame";

/**
 * Exporta uma instância do jogo Asteroid
 */
export const asteroidGame = new AsteroidGame();

/**
 * Re-exporta a classe AsteroidGame para uso direto
 */
export { AsteroidGame };

/**
 * Re-exporta componentes específicos do jogo Asteroid
 */
export * from "./components/AsteroidComponent";
export * from "./components/PlayerComponent";
export * from "./components/ProjectileComponent";
