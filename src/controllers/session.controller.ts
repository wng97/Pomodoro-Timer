import { Request, Response } from "express";
import { z } from "zod";
import {
  updateSessionStatusToInProgress,
  getStatus,
  createSettingData,
  updateSessionStatusToPause,
  resumeSessionStatusToInProgress,
  updateSettingData,
} from "../services/session.service";

const requestParamSchema = z.object({
  taskId: z.string(),
});

const settingsParamSchema = z.object({
  personId: z.string(),
});

const settingBodySchema = z.object({
  pomodoro_duration: z.number().int(),
  short_break_duration: z.number().int(),
  long_break_duration: z.number().int(),
});

const updateSessionStatusParamSchema = z.object({
  taskId: z.string(),
  sessionId: z.string(),
});

const updateSettingParamSchema = z.object({
  settingId: z.string(),
});

const updateSettingBodySchema = z
  .object({
    pomodoro_duration: z.number().int(),
    short_break_duration: z.number().int(),
    long_break_duration: z.number().int(),
  })
  .partial();

export const startSession = async (req: Request, res: Response) => {
  console.log(req.params);
  const { taskId } = requestParamSchema.parse(req.params);
  try {
    await updateSessionStatusToInProgress(taskId);
    res.status(200).send("Timer started");
  } catch (e: any) {
    console.log("e", e);
    if (e.message === "Current status is still in progress") {
      res.status(200).send(e.message);
    }
    res.status(500).send("Internal Server Error");
  }
};

export const pauseSession = async (req: Request, res: Response) => {
  const { taskId, sessionId } = updateSessionStatusParamSchema.parse(
    req.params
  );
  try {
    await updateSessionStatusToPause(taskId, sessionId);
    res.status(200).send("Timer paused");
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
  return;
};

export const resumeSession = async (req: Request, res: Response) => {
  const { taskId, sessionId } = updateSessionStatusParamSchema.parse(
    req.params
  );
  try {
    await resumeSessionStatusToInProgress(taskId, sessionId);
    res.status(200).send("Timer paused");
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
  return;
};

export const retrieveStatus = async (req: Request, res: Response) => {
  console.log(req.params);
  const { taskId } = requestParamSchema.parse(req.params);
  try {
    const result = await getStatus(taskId);

    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
};

export const createSettings = async (req: Request, res: Response) => {
  console.log("Testing", req.body);

  const { personId } = settingsParamSchema.parse(req.params);

  const reqBody = settingBodySchema.parse(req.body);
  try {
    await createSettingData(personId, reqBody);
    res.status(200).send("success!");
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  const { settingId } = updateSettingParamSchema.parse(req.params);
  const reqBody = updateSettingBodySchema.parse(req.body);

  try {
    const result = await updateSettingData(settingId, reqBody);
    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
};
