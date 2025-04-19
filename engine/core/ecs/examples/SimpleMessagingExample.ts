/**
 * Exemplo simplificado do sistema de mensagens
 */
import { MessageBus } from "../MessageBus";
import { PLAYER_EVENTS } from "../MessageTypes";

/**
 * Demonstra o uso básico do sistema de mensagens
 */
export function demonstrateMessaging(): void {
  const messageBus = MessageBus.getInstance();

  // Registrar ouvintes
  const disposer1 = messageBus.on(PLAYER_EVENTS.FIRE, (data) => {
    console.log(`Jogador atirou! Direção: ${JSON.stringify(data.direction)}`);
  });

  const disposer2 = messageBus.on(PLAYER_EVENTS.HIT, (data) => {
    console.log(`Jogador atingido! Dano: ${data.damage}`);
  });

  // Emitir mensagens
  messageBus.emit(PLAYER_EVENTS.FIRE, {
    direction: { x: 0, y: 1 },
    weapon: "laser",
  });

  messageBus.emit(PLAYER_EVENTS.HIT, {
    damage: 25,
    source: "asteroid",
  });

  // Remover ouvintes
  disposer1();
  disposer2();

  // Esta mensagem não será recebida, pois o ouvinte foi removido
  messageBus.emit(PLAYER_EVENTS.FIRE, { direction: { x: 1, y: 0 } });

  // Verificar se há ouvintes
  console.log(
    `Ainda há ouvintes para FIRE? ${
      messageBus.hasListeners(PLAYER_EVENTS.FIRE) ? "Sim" : "Não"
    }`
  );
}
