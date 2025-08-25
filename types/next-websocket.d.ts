export {};

declare global {
  interface ResponseInit {
    webSocket?: WebSocket;
  }
}