import { Setting } from "../interfaces/session.interface";

export const getSessionDuration = (session_type: string, setting: Setting) => {
  switch (session_type) {
    case "work":
      return setting.pomodoro_duration;
    case "short_break":
      return setting.short_break_duration;
    default:
      return setting.long_break_duration;
  }
};

export const computeTimeDifference = (started_at: Date, paused_at: Date) => {
  console.log("started_at: ", started_at);
  console.log("paused_at: ", paused_at);
  const diff = paused_at.getTime() - started_at.getTime();
  const diffInSeconds = diff / 1000;
  return Math.abs(diffInSeconds);
};
