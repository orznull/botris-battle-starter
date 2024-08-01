import { executeCommand, GameEvent, GameState, hardDrop, PieceData } from "../../engine";
import { Block } from "../../engine/utils";
import { Command } from "../../ws/types";

// excluding hold, hd
const NON_HD_COMMANDS: Command[] = [
  'move_left',
  'move_right',
  'rotate_cw',
  'rotate_ccw',
  'drop',
  //'hold',
]

export type PossibleMove = {
  commands: Command[],
  /**
   * resultant state
   */
  gameState: GameState,
  /**
   * piece placement / clear events
   */
  events: GameEvent[],
}

const MAX_MOVE_SEARCH_DEPTH = 20; // TOTALLY ARBITRARY
/**
 * A function to BFS the different possible moves for the current piece, disregarding hold.
 * XXX: Optimize me! This is definitely not the fastest or most memory efficient way to write this!
 */
export function getPossibleMoves(
  state: GameState, // state
): PossibleMove[] {
  const exploredPiecePositions: Set<string> = new Set(); // set to dedupe piece positions
  const arrivedAtBoards: Set<string> = new Set(); // set to dedupe boards
  const BFSQueue: PossibleMove[] = [{ gameState: state, commands: [], events: [] }];
  const possibleMoves: PossibleMove[] = [];

  while (BFSQueue.length > 0) {
    const currentlyExploring = BFSQueue.shift();
    if (!currentlyExploring) break;
    const { gameState: currentState, commands: currentCommands } = currentlyExploring;

    const pos = encodePiecePos(currentState.current)

    // dedupe by piece location, to avoid wasting time moving back and forth
    if (exploredPiecePositions.has(pos)) continue;
    exploredPiecePositions.add(pos);

    // Hard drop, and add the current state to the possible moves if we haven't seen the resultant board before.
    const { gameState: hardDroppedState, events: hardDroppedEvents } = executeCommand(currentState, "hard_drop");
    const hardDroppedBoard = encodeBoard(hardDroppedState.board);
    if (!arrivedAtBoards.has(hardDroppedBoard)) {
      arrivedAtBoards.add(hardDroppedBoard);
      possibleMoves.push({
        gameState: hardDroppedState,
        commands: currentCommands,
        events: hardDroppedEvents
      });
    }

    // if we're under the max depth, perform another command and add to queue new possible moves.
    if (currentCommands.length <= MAX_MOVE_SEARCH_DEPTH)
      for (const command of NON_HD_COMMANDS) {
        const { gameState: newState, events } = executeCommand(currentState, command);
        BFSQueue.push({
          gameState: newState,
          commands: [...currentCommands, command],
          events
        })
      }
  }
  return possibleMoves
}



/**
 * A function to DFS the different possible moves for the current piece, disregarding hold.
 * If you'd want to use this for some reason. idk.
 * XXX: Optimize me! This is definitely not the fastest or most memory efficient way to write this!
 */
export function getPossibleMovesDFS(
  state: GameState, // state
  exploredPiecePositions: Set<string> = new Set(), // set to dedupe piece positions
  arrivedAtBoards: Set<string> = new Set(), // set to dedupe boards
  currentCommands: Command[] = [], // the working state of commands
  maxDepth = 30 // totally arbitrary max depth.
): PossibleMove[] {
  const pos = encodePiecePos(state.current)


  // dedupe by piece location, to avoid wasting time moving back and forth
  if (exploredPiecePositions.has(pos)) return [];
  exploredPiecePositions.add(pos);

  const possibleMoves: PossibleMove[] = [];

  // Perform the current sequence of commands, and 
  const { gameState: hardDroppedState, events: hardDroppedEvents } = executeCommand(state, "hard_drop");
  const hardDroppedBoard = encodeBoard(hardDroppedState.board);
  if (!arrivedAtBoards.has(hardDroppedBoard)) {
    arrivedAtBoards.add(hardDroppedBoard);
    possibleMoves.push({
      gameState: hardDroppedState,
      commands: currentCommands,
      events: hardDroppedEvents
    });
  }

  // if we're under the max depth, recurse and add new possible moves.
  if (currentCommands.length <= maxDepth)
    for (const command of NON_HD_COMMANDS) {
      const { gameState: newState } = executeCommand(state, command);
      for (const moves of getPossibleMovesDFS(newState, exploredPiecePositions, arrivedAtBoards, [...currentCommands, command], maxDepth)) {
        possibleMoves.push(moves);
      }
    }

  return possibleMoves
}

function encodePiecePos(pieceData: PieceData): string {
  return `r${pieceData.rotation}x${pieceData.x}y${pieceData.y}`;
}

function encodeBoard(board: Block[][]): string {
  return board.map(row => row.map(cell => cell === null ? "n" : cell).join("")).join("\n");
}
