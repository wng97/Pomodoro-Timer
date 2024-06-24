import { describe, expect, it, vi } from "vitest";
import {
  updateSessionStatusToInProgress,
  updateSessionStatusToPause,
} from "../../services/session.service";
import { startSession, pauseSession } from "../session.controller";
import { createRequest, createResponse } from "node-mocks-http";
import * as sessionService from "../../services/session.service";

describe("Session controller", () => {
  const res = createResponse();

  describe("startSession", () => {
    it("Should call updateSessionStatusToInProgress with correct param", async () => {
      const fakeRequest = createRequest({
        params: {
          taskId: "1",
        },
      });

      await startSession(fakeRequest, res);
      vi.spyOn(sessionService, "updateSessionStatusToInProgress")
        .mockReturnThis;
      expect(updateSessionStatusToInProgress).toHaveBeenCalledOnce;
      const fakeResponse = res._getData();
      console.log(fakeResponse);
      expect(fakeResponse).toBe("Timer started");
    });

    it("Should call updateSessionStatusToInProgress with error if the taskId does not exists", async () => {
      const fakeRequest = createRequest({
        params: {
          taskId: "abcd123",
        },
      });
      await startSession(fakeRequest, res);
      vi.spyOn(sessionService, "updateSessionStatusToInProgress")
        .mockReturnThis;
      expect(updateSessionStatusToInProgress).toHaveBeenCalledOnce;
      const fakeResponse = res._getData();
      console.log(fakeResponse);
      expect(fakeResponse).toContain("Internal Server Error");
    });

    it("Should call updateSessionStatusToInProgress with error if the task is current status is in progress", async () => {
      const fakeRequest = createRequest({
        params: {
          taskId: "abcd123",
        },
      });
      await startSession(fakeRequest, res);
      vi.spyOn(sessionService, "updateSessionStatusToInProgress")
        .mockReturnThis;
      expect(updateSessionStatusToInProgress).toHaveBeenCalledOnce;
      const fakeResponse = res._getData();
      console.log(fakeResponse);
      expect(fakeResponse).toContain("Internal Server Error");
    });
  });

  describe("pauseSession", () => {
    it("Should call updateSessionStatusToPause with correct param", async () => {
      const fakeRequest = createRequest({
        params: {
          taskId: "t123",
          sessionId: "s123",
        },
      });
      await pauseSession(fakeRequest, res);
      expect(updateSessionStatusToPause).toHaveBeenCalledOnce;
    });
  });
});
