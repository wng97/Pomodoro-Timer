import { Router } from "express";
// import app from "../app";
import {
  retrieveStatus,
  startSession,
  createSettings,
  pauseSession,
  resumeSession,
  updateSettings,
} from "../controllers/session.controller";

const routers = Router();
/** Below is all the API for session and task
 ** startSession is to start the timer for the first time
 ** pauseSession is to pause the timer when the status is in_progress
 ** resumeSession is to resume the timer when the status is paused
 ** retrieveStatus is to retrieve the status of current session
 */
routers.post("/task/:taskId/start", startSession);
routers.post("/task/:taskId/pause/:sessionId", pauseSession);
routers.post("/task/:taskId/resume/:sessionId", resumeSession);
routers.get("/task/:taskId", retrieveStatus);

/** Below is all the API for setting
 ** createSettings is to insert the setting value to db
 ** updateSettings is to update the existing setting value to db
 */
routers.post("/setting/:personId", createSettings);
routers.put("/setting/:settingId", updateSettings);

// app.use(router);

export default routers;
