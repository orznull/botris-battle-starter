/* sample bot file, kills itself as fast as possible */
import { initializeSocket } from "../ws/initializeSocket";
import "dotenv/config";
import { ActionEvent, RequestMoveEvent, ServerEvent } from "../ws/types";
import WebSocket from "ws";
import { getPossibleMoves, PossibleMove, publicGameStateToGameState } from "./utils";
import { Block, getBoardBumpiness, getBoardHeights } from "../engine/utils";
import { GameState } from "../engine";

// ----- this is the main bulk of bot code, make edits here -----
export const onRequestMove = (event: RequestMoveEvent): ActionEvent => {
  const moves = getPossibleMoves(publicGameStateToGameState(event.payload.gameState));
  let bestVal = 9999;
  const bestMove = moves.reduce<PossibleMove | undefined>((best, current) => {
    if (!best) return current;
    const currVal = countHoles(current.gameState.board) + maxHeight(current.gameState);
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

const maxHeight = (gameState: GameState) => getBoardHeights(gameState.board).reduce((a, b) => Math.max(a, b), 0);


function countHoles(board: Block[][]): number {
  const boardCopy = board.map(row => row.slice());
  let count = 0;

  for (let i = 0; i < boardCopy.length; i++) {
    for (let j = 0; j < (boardCopy[i]?.length ?? 0); j++) {
      if (boardCopy[i]![j] === null) {
        count++;
        floodFill(boardCopy, i, j); // Use -1 as the fill value to mark visited cells
      }
    }
  }

  return count;
}

function floodFill(board: Block[][], x: number, y: number): void {
  if (x < 0 || x >= board.length || y < 0 || !board[0] || y >= board[0].length) {
    return;
  }
  if (board[x]![y]) {
    return;
  }

  if (board[x])
    board[x][y] = 'G';

  floodFill(board, x + 1, y);
  floodFill(board, x - 1, y);
  floodFill(board, x, y + 1);
  floodFill(board, x, y - 1);
}


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
initializeSocket(onMessage);
