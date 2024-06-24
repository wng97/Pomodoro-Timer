import pool from "../db";
import {
  CreateSetting,
  Setting,
  UpdateSetting,
} from "../interfaces/session.interface";
import { scheduleJob, scheduledJobs } from "node-schedule";
import {
  getSessionDuration,
  computeTimeDifference,
} from "../utils/session.util";
import { server } from "../server/websocket.server";
import moment from "moment";

// pomodoro_duration: number;
// short_break_duration: number;
// long_break_duration: number;
export const updateSessionStatusToInProgress = async (taskId: string) => {
  const psqlServer = await pool.connect();
  const taskRowsData = await psqlServer.query(
    `SELECT t1.*, t2.pomodoro_duration, t2.short_break_duration, t2.long_break_duration FROM task t1 INNER JOIN setting t2 ON t1.person_id = t2.person_id WHERE t1.id=${taskId}`
  );
  if (!taskRowsData.rows.length) {
    //throw error cause all these data should be created when they create task
    throw new Error("No task found!");
  }
  const taskData = taskRowsData.rows[0];
  const setting: Setting = {
    pomodoro_duration: taskData.pomodoro_duration,
    short_break_duration: taskData.short_break_duration,
    long_break_duration: taskData.long_break_duration,
  };
  let durationSeconds = getSessionDuration(taskData.session_type, setting);
  const durationMillisecond = durationSeconds * 1000;
  const started_at = new Date();
  const formated_started_at = moment(started_at).format("YYYY-MM-DD HH:mm:ss");
  const result = await psqlServer.query(`
    INSERT INTO session(type, current_status, task_id, started_at) VALUES ('${taskData.session_type}', 'in_progress', ${taskId}, '${formated_started_at}') RETURNING id
  `);
  const session_id = result.rows[0].id;
  console.log("session_id", session_id);

  psqlServer.release();
  const endTime = new Date(started_at.getTime() + durationMillisecond);
  const taskName = `task_${taskId}-session_${session_id}`;
  scheduleJob(
    taskName,
    {
      start: started_at,
      end: endTime,
      rule: "*/1 * * * * *",
    },
    () => {
      durationSeconds--;
      console.log(durationSeconds);
      server.clients.forEach(async (client) => {
        client.send(durationSeconds);
        if (durationSeconds === 0) {
          client.send("Time's up!!");
          await queueNextSession(taskName);
          //check for other task and sessions
        }
      });
    }
  );
  console.log("result", result);
  return result;
};

export const updateSessionStatusToPause = async (
  taskId: string,
  sessionId: string
) => {
  const psqlServer = await pool.connect();
  const taskName = `task_${taskId}-session_${sessionId}`;
  const paused_at = new Date();
  const formated_paused_at = moment(paused_at).format("YYYY-MM-DD HH:mm:ss");
  const result = await psqlServer.query(
    `UPDATE session SET paused_at = '${formated_paused_at}' WHERE id=${sessionId};`
  );
  const selected_task = scheduledJobs[taskName];
  selected_task.cancel();

  return result;
};

export const resumeSessionStatusToInProgress = async (
  taskId: string,
  sessionId: string
) => {
  const psqlServer = await pool.connect();
  const sessionRowsData = await psqlServer.query(
    `SELECT t1.id, t1.current_status, t1.started_at, t1.paused_at, t2.person_id, t2.session_type, t3.pomodoro_duration, t3.short_break_duration, t3.long_break_duration FROM session t1 INNER JOIN task t2 on t1.task_id = t2.id INNER JOIN setting t3 on t2.person_id = t3.person_id WHERE t1.task_id = ${taskId} AND t1.id = ${sessionId};`
  );
  const sessionData = sessionRowsData.rows[0];
  const durationSecondsTaken = computeTimeDifference(
    sessionData.started_at,
    sessionData.paused_at
  );
  const setting: Setting = {
    pomodoro_duration: sessionData.pomodoro_duration,
    short_break_duration: sessionData.short_break_duration,
    long_break_duration: sessionData.long_break_duration,
  };
  let sessionDurationSeconds = getSessionDuration(
    sessionData.session_type,
    setting
  );
  let reaminingDurationSeconds = sessionDurationSeconds - durationSecondsTaken;

  const endTime = new Date(
    new Date().getTime() + reaminingDurationSeconds * 1000
  );
  const taskName = `task_${taskId}-session_${sessionId}`;
  scheduleJob(
    taskName,
    {
      start: sessionData.started_at,
      end: endTime,
      rule: "*/1 * * * * *",
    },
    () => {
      reaminingDurationSeconds--;
      console.log(reaminingDurationSeconds);
      server.clients.forEach(async (client) => {
        client.send(reaminingDurationSeconds);
        if (reaminingDurationSeconds === 0) {
          client.send("Time's up!!");
          await queueNextSession(taskName);
          //check for other task and sessions
        }
      });
    }
  );
  return "success";
};

export const queueNextSession = async (taskName: string) => {
  const [taskWithId, sessionWithId] = taskName.split("-");
  const task_id = taskWithId.split("_")[1];
  const session_id = sessionWithId.split("_")[1];
  const psqlServer = await pool.connect();
  const taskRowsData = await psqlServer.query(
    `SELECT t1.*, t2.long_break_interval FROM task t1 INNER JOIN setting t2 on t1.person_id = t2.person_id WHERE t1.id = ${task_id};`
  );
  const taskData = taskRowsData.rows[0];

  let updated_current_cycle = taskData.current_cycle;
  let updated_session_type = taskData.session_type;
  // check current cycle
  if (updated_session_type === "work") {
    console.log("session_type work");
    updated_current_cycle += 1;
    updated_session_type =
      updated_current_cycle % taskData.long_break_interval == 0
        ? "short_break"
        : "long_break";
  } else {
    updated_session_type = "work";
  }
  const ended_at = new Date();
  const formated_ended_at = moment(ended_at).format("YYYY-MM-DD HH:mm:ss");
  // if updated cycle its bigger than the total number of cycle, stop the timer and update the session end time
  psqlServer.query(
    `UPDATE session SET ended_at='${formated_ended_at}', current_status='end' WHERE id=${session_id};`
  );
  if (updated_current_cycle > taskData.num_of_cycles) {
    psqlServer.release();
    server.clients.forEach((client) => {
      client.send("Well done! Your have completed all your session!");
    });
    return;
  }

  psqlServer.query(
    `UPDATE task SET current_cycle=${updated_current_cycle}, session_type='${updated_session_type}' WHERE id=${task_id};`
  );
  psqlServer.release();
  await updateSessionStatusToInProgress(task_id);

  return;
};

export const getStatus = async (taskId: string) => {
  const psqlServer = await pool.connect();
  const currentData = await psqlServer.query(
    `SELECT s.* FROM session s JOIN task t ON s.task_id = t.id WHERE t.id = ${taskId} AND t.current_type = s.type;`
  );

  if (!currentData.rows.length) {
    //throw error cause all these data should be created when they create task
    throw new Error("Something went wrong");
  }

  return currentData.rows[0].current_status;
};

export const createSettingData = async (
  personId: string,
  reqBody: CreateSetting
) => {
  const { pomodoro_duration, short_break_duration, long_break_duration } =
    reqBody;

  const psqlServer = await pool.connect();
  const result = await psqlServer.query(
    `INSERT INTO setting(pomodoro_duration, short_break_duration, long_break_duration, person_id) VALUES (${pomodoro_duration}, ${short_break_duration},  ${long_break_duration}, ${personId})`
  );
  psqlServer.release();
  return result;
};

export const updateSettingData = async (
  settingId: string,
  reqBody: UpdateSetting
) => {
  if (!Object.keys(reqBody).length) {
    return "No Data Updated!";
  }
  let assignQueries = "";
  for (const key in reqBody) {
    const value = reqBody[key as keyof UpdateSetting];
    if (assignQueries === "") {
      assignQueries = `${key}=${value}`;
    } else {
      assignQueries += `, ${key}=${value}`;
    }
  }
  const psqlServer = await pool.connect();
  await psqlServer.query(
    `UPDATE setting SET ${assignQueries} WHERE id=${settingId}`
  );
  psqlServer.release();

  return "Setting Updated!";
};
