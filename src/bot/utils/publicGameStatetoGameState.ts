import { GameState, PublicGameState } from "../../engine";

/**
 * A function to convert from the "public game state" type to the internal game state type.
 * The main difference is knowledge of how cheesy the garbage is.
 * If no information is provided, just assuming it's a big line.
 */
export function publicGameStateToGameState(state: PublicGameState, garbageQueue?: number[]): GameState {
  return {
    ...state,
    garbageQueue: garbageQueue ?? [state.garbageQueued]
  }
}
