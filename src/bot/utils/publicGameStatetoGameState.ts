import { GameState, PublicGameState } from "libtris";

/**
 * A function to convert from the "public game state" type to the internal game state type.
 * The main difference is knowledge of different garbage segment the garbage is.
 * If no information is provided, we'll just assume it's a big line.
 */
export function publicGameStateToGameState(state: PublicGameState, garbageQueue?: number[]): GameState {
  return {
    ...state,
    garbageQueue: garbageQueue ?? [state.garbageQueued]
  }
}
