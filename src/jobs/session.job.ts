import { scheduleJob } from "node-schedule";
import { server } from "../app";
// import { computeDuration } from "../utils/session.util";

function startCountdown(
  jobId: string,
  startTime: Date,
  endTime: Date,
  durationSeconds: number
) {
  scheduleJob(
    {
      start: startTime,
      end: endTime,
      rule: "*/1 * * * * *", // Every second
    },
    () => {
      durationSeconds--;
      server.clients.forEach((client) => {
        client.send(durationSeconds);
        if (durationSeconds === 0) {
          client.send("Time's up!!");
          //check for other task and sessions
        }
      });
    }
  );
}
