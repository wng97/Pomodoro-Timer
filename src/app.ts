// Import the 'express' module
import express from "express";

import routers from "./routers";

import bodyParser from "body-parser";

// Create an Express application
const app = express();

app.use(bodyParser.json());
// Set the port number for the server
const port = 3000;

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});

app.use(routers);

export default app;
