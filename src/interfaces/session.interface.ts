export interface CreateSetting {
  pomodoro_duration: number;
  short_break_duration: number;
  long_break_duration: number;
}

export interface Setting {
  id?: string;
  pomodoro_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  person_id?: string;
}

export interface UpdateSetting {
  pomodoro_duration?: number;
  short_break_duration?: number;
  long_break_duration?: number;
}
