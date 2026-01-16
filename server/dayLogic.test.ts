import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAvailableDayNumber,
  isDayUnlocked,
  getDayStatus,
  getDaysUntilUnlock,
  getUnlockDate,
  getProgressStats,
} from "./dayLogic";

describe("Day Logic", () => {
  let startDate: Date;

  beforeEach(() => {
    // Set a fixed start date for testing
    startDate = new Date("2026-01-16");
    startDate.setHours(0, 0, 0, 0);
  });

  describe("getAvailableDayNumber", () => {
    it("should return 1 on the start date", () => {
      const now = new Date("2026-01-16");
      now.setHours(12, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = getAvailableDayNumber(startDate);
      expect(result).toBe(1);

      vi.useRealTimers();
    });

    it("should return 2 on the next day", () => {
      const now = new Date("2026-01-17");
      now.setHours(12, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = getAvailableDayNumber(startDate);
      expect(result).toBe(2);

      vi.useRealTimers();
    });

    it("should return 21 when past day 21", () => {
      const now = new Date("2026-02-10");
      now.setHours(12, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = getAvailableDayNumber(startDate);
      expect(result).toBe(21);

      vi.useRealTimers();
    });
  });

  describe("isDayUnlocked", () => {
    it("should unlock day 1 on start date", () => {
      const now = new Date("2026-01-16");
      now.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      expect(isDayUnlocked(1, startDate)).toBe(true);

      vi.useRealTimers();
    });

    it("should not unlock day 2 on start date", () => {
      const now = new Date("2026-01-16");
      now.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      expect(isDayUnlocked(2, startDate)).toBe(false);

      vi.useRealTimers();
    });

    it("should unlock day 2 on the next day", () => {
      const now = new Date("2026-01-17");
      now.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      expect(isDayUnlocked(2, startDate)).toBe(true);

      vi.useRealTimers();
    });

    it("should return false for invalid day numbers", () => {
      expect(isDayUnlocked(0, startDate)).toBe(false);
      expect(isDayUnlocked(22, startDate)).toBe(false);
    });
  });

  describe("getDayStatus", () => {
    it("should return 'completed' when day is completed", () => {
      const now = new Date("2026-01-16");
      now.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const status = getDayStatus(1, startDate, true);
      expect(status).toBe("completed");

      vi.useRealTimers();
    });

    it("should return 'available' when day is unlocked and not completed", () => {
      const now = new Date("2026-01-16");
      now.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const status = getDayStatus(1, startDate, false);
      expect(status).toBe("available");

      vi.useRealTimers();
    });

    it("should return 'locked' when day is not unlocked", () => {
      const now = new Date("2026-01-16");
      now.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const status = getDayStatus(2, startDate, false);
      expect(status).toBe("locked");

      vi.useRealTimers();
    });
  });

  describe("getDaysUntilUnlock", () => {
    it("should return 0 for an unlocked day", () => {
      const now = new Date("2026-01-16");
      now.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      expect(getDaysUntilUnlock(1, startDate)).toBe(0);

      vi.useRealTimers();
    });

    it("should return correct days until unlock", () => {
      const now = new Date("2026-01-16");
      now.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      expect(getDaysUntilUnlock(3, startDate)).toBe(2);
      expect(getDaysUntilUnlock(5, startDate)).toBe(4);

      vi.useRealTimers();
    });
  });

  describe("getProgressStats", () => {
    it("should calculate progress correctly", () => {
      const now = new Date("2026-01-20");
      now.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const stats = getProgressStats(startDate, [1, 2, 3, 4]);

      expect(stats.currentDay).toBe(5);
      expect(stats.totalCompleted).toBe(4);
      expect(stats.progressPercentage).toBe(19); // 4/21 * 100
      expect(stats.daysRemaining).toBe(17);
      expect(stats.isJourneyComplete).toBe(false);

      vi.useRealTimers();
    });

    it("should mark journey as complete when all days are done", () => {
      const now = new Date("2026-02-06");
      now.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(now);

      const completedDays = Array.from({ length: 21 }, (_, i) => i + 1);
      const stats = getProgressStats(startDate, completedDays);

      expect(stats.isJourneyComplete).toBe(true);
      expect(stats.progressPercentage).toBe(100);

      vi.useRealTimers();
    });
  });
});
