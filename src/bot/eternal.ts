/* sample bot file, stacks for tetrises without looking at queue. plays according to principles only. */
import { initializeSocket } from "../ws/initializeSocket";
import "dotenv/config";
import { ActionEvent, RequestMoveEvent, ServerEvent } from "../ws/types";
import WebSocket from "ws";
import { getPossibleMovesWithHold, PossibleMove, publicGameStateToGameState } from "./utils";
import { GameEvent, GameState, Block, getBoardHeights } from "libtris";

// ----- this is the main bulk of bot code, make edits here -----
const onRequestMove = (event: RequestMoveEvent): ActionEvent => {
  const state = publicGameStateToGameState(event.payload.gameState);

  const moves = getPossibleMovesWithHold(state)

  let bestVal = 99999;
  const bestMove = moves.reduce<PossibleMove | undefined>((best, current) => {
    if (!best) return current;

    const currVal = (evaluateState(current.gameState, current.events));

    if (currVal < bestVal) {
      bestVal = currVal;
      return current;
    }
    return best;
  }, undefined);

  return {
    type: 'action',
    payload: {
      commands: bestMove?.commands || []
    }
  };
}

/**
 * An unused evaluation function that evaluates a move for a specified queue depth
 * It is extremely bad and unoptimized. Probably in my movement evaluation code.
 */
function searchEvaluate(gameState: GameState, events: GameEvent[] = [], depth: number = 1): number {
  if (depth === 0) return evaluateState(gameState, events);
  const moves = getPossibleMovesWithHold(gameState);
  return moves.reduce((best, e) => Math.min(searchEvaluate(e.gameState, [...events, ...e.events], depth - 1), best), 0);
}

/**
 * My heuristic evaluation function. Tried to stick to the principles I laid out in my stacking tutorial lmao
 * in short:
 * Avoid creating holes
 * Prioritize flat boards (low difference between min and max column heights)
 * Prioritize boards without "pits" (i/j/l deps)
 * Prioritize boards without "spiky shapes" (localized odd parity)
 * Prioritize boards without "cliffs" (large changes in height)
 * At board height <= 10, clear only for tetrises
 * At board height > 10, prioritize reducing board height
 */
function evaluateState(gameState: GameState, events: GameEvent[]) {
  const board = gameState.board;

  const boardHeight = maxHeight(board);

  const clearedLines = events.reduce((lines, curr) =>
    curr.type === "clear" ? curr.payload?.clearedLines?.length + lines : lines
    , 0);
  const isClear = clearedLines > 0
  const isTetrisClear = isClear && clearedLines >= 4;

  return (
    // at all costs, we should try to avoid creating a hole in our stack.
    countColumnHoles(board) * 40 +
    // if we're in tetris mode, it's ok to have 1 pit, your tetris well
    (boardHeight <= 10 ? Math.max(countPits(board) - 1, 0) : countPits(board)) * 5 +
    flatness(board) * 3 +
    cliffHeights(board) * 3 +
    spikyShapes(board) * 2
    // if we're out of tetris mode, prioritize reducing board height.
    + (boardHeight > 10 ? boardHeight : 0) * 15
    + (boardHeight <= 10 && (isClear && !isTetrisClear) ? 9999 : 0)
    + (isTetrisClear ? -9999 : 0)
  )

}

/**
 * Counts number of holes within each column-- this means an overhanging block, even if the space underneath it is not totally enclosed, is counted as a hole.
 */
function countColumnHoles(board: Block[][]): number {
  let total = 0;
  for (let x = 0; x < (board[0]?.length ?? 0); x++) {
    let y = board.length - 1;
    let holes = 0;
    let seenBlock = false;
    while (y >= 0) {
      if (!board[y]![x]) {
        if (seenBlock) {
          holes++;
        }
      } else {
        seenBlock = true;
      }
      y--;
    }
    total += holes;
  }

  return total;
}

/**
 * total # of i/j/l dependencies
 */
const countPits = (board: Block[][]) => {
  const heights = getBoardHeights(board);
  let count = 0;
  for (let i = 0; i < heights.length; i++) {
    const leftHeight = i - 1 < 0 ? 999 : heights[i - 1];
    const rightHeight = i + 1 >= heights.length ? 999 : heights[i + 1];
    if ((leftHeight - 2 >= heights[i]) && (rightHeight - 2 >= heights[i])) {
      count += 1;
      // count += Math.min(leftHeight - heights[i], rightHeight - heights[i]);
    }
  }
  return count;
}

/**
 * total of large (2 blocks or higher) differences in height between columns
 */
const cliffHeights = (board: Block[][]) => {
  const heights = getBoardHeights(board);
  let count = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    if (Math.abs(heights[i] - heights[i + 1]) > 1) {
      count += Math.abs(heights[i] - heights[i + 1]);
    }
  }
  return count;
}

/**
 * # of "spiky shapes", defined as segments of 3 columns with odd parity.
 */
const spikyShapes = (board: Block[][]) => {
  const heights = getBoardHeights(board);
  let count = 0;
  for (let i = 0; i < heights.length - 2; i++) {
    if (Math.abs(heights[i] - heights[i + 1]) == 1 && Math.abs(heights[i + 1] - heights[i + 2]) == 1) {
      count += Math.abs(heights[i] - heights[i + 1]);
    }
  }
  return count;
}

const flatness = (board: Block[][]) => {
  return maxHeight(board) - minHeight(board);
}

const maxHeight = (board: Block[][]) => getBoardHeights(board).reduce((a, b) => Math.max(a, b), 0);
const minHeight = (board: Block[][]) => getBoardHeights(board).reduce((a, b) => Math.min(a, b), 0);

// const G: Block = 'O' as Block
// const N = null
// console.log(countColumnHoles([
//   [G, G, G, G],
//   [N, N, N, N],
//   [G, N, G, G],
//   [G, G, G, G],
//   [G, N, G, G],
//   [G, N, G, N]
// ]))

// ---------------------------------------------


const getReply = (event: ServerEvent): object | undefined => {
  if (event.type == "request_move") return onRequestMove(event)
  // respond to more events here if you want
}

// silly little init code here
const onMessage = (ws: WebSocket, data: WebSocket.RawData) => {
  const event = JSON.parse(data.toString()) as ServerEvent;
  const reply = getReply(event);
  if (reply) ws.send(JSON.stringify(reply));
}


export const ETERNAL = {
  name: "eternal exercisers",
  start: () => initializeSocket(onMessage)
}

