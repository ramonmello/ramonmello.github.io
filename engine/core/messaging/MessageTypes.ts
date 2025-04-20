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

/**
 * Mensagens de colisão
 */
export const COLLISION_EVENTS = {
  // Eventos de detecção (usado para lógica de jogo)
  DETECT: "collision.detect",

  // Eventos de resolução (usado para física)
  RESOLVE: "collision.resolve",

  // Eventos de trigger (para colisores com isTrigger=true)
  ENTER: "collision.trigger.enter",
  STAY: "collision.trigger.stay",
  EXIT: "collision.trigger.exit",
};

// Mensagens de jogo
export const GAME_EVENTS = {
  SCORE_CHANGED: "scoreChanged",
  LEVEL_CHANGED: "levelChanged",
  GAME_OVER: "gameOver",
  GAME_WIN: "gameWin",
  GAME_PAUSE: "gamePause",
  GAME_RESUME: "gameResume",

  // Novas mensagens específicas para o ciclo de vida do jogo
  INITIALIZED: "gameInitialized",
  STARTED: "gameStarted",
  PAUSED: "gamePaused",
  RESUMED: "gameResumed",
  STOPPED: "gameStopped",
  RESTARTED: "gameRestarted",
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

/**
 * Tipos de mensagens para comunicação entre componentes e sistemas
 */
export const MESSAGE_TYPES = {
  // Tipos de mensagens gerais do ECS
  ECS: {
    ENTITY_CREATED: "entity.created",
    ENTITY_DESTROYED: "entity.destroyed",
    COMPONENT_ADDED: "component.added",
    COMPONENT_REMOVED: "component.removed",
  },

  // Mensagens relacionadas à entrada do usuário
  INPUT: {
    KEY_DOWN: "input.key.down",
    KEY_UP: "input.key.up",
    MOUSE_DOWN: "input.mouse.down",
    MOUSE_UP: "input.mouse.up",
    MOUSE_MOVE: "input.mouse.move",
  },

  // Mensagens relacionadas ao ciclo de vida do jogo
  GAME: {
    INIT: "game.init",
    START: "game.start",
    PAUSE: "game.pause",
    RESUME: "game.resume",
    END: "game.end",
  },
};
