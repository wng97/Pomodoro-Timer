// Import the 'express' module
import express from "express";
import routers from "./routers";
import WebSocket from "ws";
import bodyParser from "body-parser";
// import dotenv from "dotenv"

// dotenv.config()
// const {REDIS_HOST, REDIS_PORT,REDIS_PASSWORD}= process.env

// const redisOp

// Create an Express application
const app = express();

app.use(bodyParser.json());
// Set the port number for the server
const port = 3000;

// Create a WebSocket server attached to the HTTP server
const server = new WebSocket.Server({ port: 8765 });

// Handle new WebSocket connections
server.on("connection", (ws) => {
  console.log("Client connected");

  // Handle WebSocket connection closure
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});

app.use(routers);
export { server };
export default app;
