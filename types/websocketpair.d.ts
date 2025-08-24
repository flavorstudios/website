export {};

declare global {
  interface WebSocketPair {
    0: WebSocket;
    1: WebSocket;
  }

  var WebSocketPair: {
    new (): WebSocketPair;
  };
}