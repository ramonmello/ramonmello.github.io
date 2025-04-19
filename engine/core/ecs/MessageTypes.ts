/**
 * Constantes para tipos de mensagens do sistema
 * Usar estas constantes em vez de strings diretas ajuda a evitar erros
 * de digitação e facilita refatorações
 */

// Mensagens do World
export const WORLD_EVENTS = {
  STARTED: "worldStarted",
  STOPPED: "worldStopped",
  CLEARED: "worldCleared",
  DESTROYED: "worldDestroyed",
  PRE_UPDATE: "preUpdate",
  POST_UPDATE: "postUpdate",
  ENTITY_ADDED: "entityAdded",
  ENTITY_REMOVED: "entityRemoved",
};

// Mensagens de interação de jogador
export const PLAYER_EVENTS = {
  MOVE: "playerMove",
  FIRE: "playerFire",
  BOOST: "playerBoost",
  HIT: "playerHit",
  DIE: "playerDie",
  RESPAWN: "playerRespawn",
};

// Mensagens de colisão
export const COLLISION_EVENTS = {
  DETECT: "collisionDetect",
  RESOLVE: "collisionResolve",
};

// Mensagens de jogo
export const GAME_EVENTS = {
  SCORE_CHANGED: "scoreChanged",
  LEVEL_CHANGED: "levelChanged",
  GAME_OVER: "gameOver",
  GAME_WIN: "gameWin",
  GAME_PAUSE: "gamePause",
  GAME_RESUME: "gameResume",
};

// Mensagens de projéteis
export const PROJECTILE_EVENTS = {
  FIRE: "projectileFire",
  HIT: "projectileHit",
  EXPIRE: "projectileExpire",
};

// Mensagens de entidades
export const ENTITY_EVENTS = {
  CREATED: "entityCreated",
  DESTROYED: "entityDestroyed",
  UPDATED: "entityUpdated",
  COMPONENT_ADDED: "componentAdded",
  COMPONENT_REMOVED: "componentRemoved",
  STATE_CHANGED: "entityStateChanged",
};
