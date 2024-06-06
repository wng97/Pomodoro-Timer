// import { server } from "../app";

// // Function to handle the timer logic
// export const timerHandler = (duration: number) => {
//   // Set a timeout for the specified duration
//   console.log("timerHandler!!!!");
//   setTimeout(() => {
//     // Notify all connected WebSocket clients after the timer ends
//     server.clients.forEach((client) => {
//       if (client.readyState === client.OPEN) {
//         client.send("Timer ended");
//       }
//     });
//   }, duration);
// };
