/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ============ CUSTOM TYPES ============

export type DayStatus = "available" | "locked" | "completed";

export interface DayWithStatus {
  day: number;
  mission: string;
  environments: string[];
  assumption: string;
  safetyBehavior: string;
  internalFocus: string;
  script: string;
  defaultLearning: string;
  status: DayStatus;
  daysUntilUnlock: number;
  unlockDate: Date;
  isCompleted: boolean;
  assumptionOccurred: boolean | null | undefined;
  repeatedNextDay: boolean;
}

export interface ProgressStats {
  currentDay: number;
  totalCompleted: number;
  progressPercentage: number;
  daysRemaining: number;
  isJourneyComplete: boolean;
}

export interface SessionData {
  sessionId: number;
  userId: number;
  startDate: Date;
  consentGiven: boolean;
}

export interface CheckpointData {
  id: number;
  sessionId: number;
  dayNumber: number;
  discovery?: string;
  importantDay?: string;
  feeling?: "more_confident" | "equal" | "confused";
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningData {
  id: number;
  sessionId: number;
  dayNumber: number;
  defaultLearning: string;
  customLearning?: string;
  createdAt: Date;
}

export interface ConsentData {
  id: number;
  sessionId: number;
  consentGiven: boolean;
  consentDate: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
