import WebSocket from 'ws';
import 'dotenv/config'

/**
 * Helper function to connect to the botris site.
 * token / room key are 
 */
export async function initializeSocket(
  onMessage: (ws: WebSocket, data: WebSocket.RawData) => void,
  token: string | undefined = process.env.TOKEN,
  roomKey: string | undefined = process.env.ROOM_KEY,
): Promise<WebSocket> {
  if (!token) {
    throw new Error("no token found in .env. get it from botrisbattle.com/dashboard");
  }
  if (!roomKey) {
    throw new Error("no room key found. enter it properly or add it to .env.");
  }
  return new Promise((resolve, reject) => {
    const url = `wss://botrisbattle.com/ws?token=${token}&roomKey=${roomKey}`;
    const ws = new WebSocket(url);

    ws.on('open', () => {
      console.log('Connected to the server');
      resolve(ws);
    });

    ws.on('message', (data) => onMessage(ws, data));

    ws.on('close', (data) => {
      reject("Socket closed.");
      console.log('Disconnected from the server');
    });

    ws.on('error', function error(err) {
      reject(err);
      console.error('WebSocket error:', err);
    });
  });

}