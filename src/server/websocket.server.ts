import { WebSocketServer } from "ws";

// Create a WebSocket server attached to the HTTP server
const server = new WebSocketServer({ port: 8785 });
// const server = new WebSocket.Server({ port: 8765 });

// Handle new WebSocket connections
server.on("connection", (ws) => {
  console.log("Client connected");

  // Handle WebSocket connection closure
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

export { server };
