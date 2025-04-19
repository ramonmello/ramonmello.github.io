import { create } from "zustand";

interface GameState {
  score: number;
  gameOver: boolean;

  incrementScore: (by: number) => void;
  setGameOver: (flag: boolean) => void;
  resetGameState: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  gameOver: false,

  incrementScore: (by) => set((s) => ({ score: s.score + by })),
  setGameOver: (flag) => set({ gameOver: flag }),
  resetGameState: () => set({ score: 0, gameOver: false }),
}));
