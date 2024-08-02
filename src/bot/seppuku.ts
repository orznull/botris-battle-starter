/*

sample bot that kills itself as fast as possible

*/
import { initializeSocket } from "../ws/initializeSocket";
import "dotenv/config";
import { ActionEvent, RequestMoveEvent, ServerEvent } from "../ws/types";
import WebSocket from "ws";
import { getPossibleMovesWithHold, PossibleMove, publicGameStateToGameState } from "./utils";
import { getBoardHeights } from "../engine/utils";
import { GameState } from "../engine";

// ----- this is the main bulk of bot code, make edits here -----
const onRequestMove = (event: RequestMoveEvent): ActionEvent => {

  const state = publicGameStateToGameState(event.payload.gameState);
  const moves = getPossibleMovesWithHold(state);

  const bestMove = moves.reduce<PossibleMove | undefined>((best, current) => {
    if (!best) return current;
    const currHeight = maxHeight(current.gameState);
    const bestHeight = maxHeight(best.gameState)
    if (currHeight > bestHeight || currHeight === bestHeight && current.commands.length < best.commands.length)
      return current;
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

export const SEPPUKU = {
  name: "seppuku",
  start: () => initializeSocket(onMessage)
}
