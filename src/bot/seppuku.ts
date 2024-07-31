/* sample bot file, just hard drops and dies */
import { initializeSocket } from "../ws/initializeSocket";
import "dotenv/config";
import { ActionEvent, RequestMoveEvent, ServerEvent } from "../ws/types";
import WebSocket from "ws";

// ----- this is the main bulk of bot code, make edits here -----
export const onRequestMove = (event: RequestMoveEvent): ActionEvent => {
  return {
    type: 'action',
    payload: {
      commands: ["drop"]
    }
  };
}
// ---------------------------------------------



const getReply = (event: ServerEvent): object | undefined => {
  if (event.type == "request_move") return onRequestMove(event)
  // respond to more events here if you want
}

// silly little init code here
const onMessage = (ws: WebSocket, data: WebSocket.RawData) => {
  console.log(data.toString());
  const event = JSON.parse(data.toString()) as ServerEvent;
  const reply = getReply(event);
  if (reply) ws.send(JSON.stringify(reply));
}
initializeSocket(onMessage);
