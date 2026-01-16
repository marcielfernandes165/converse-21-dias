import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  sessions,
  dayProgress,
  learnings,
  checkpoints,
  consents,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ SESSION QUERIES ============

export async function getSessionByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createSession(
  userId: number,
  token: string,
  startDate: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(sessions).values({
    userId,
    token,
    startDate,
  });

  return getSessionByToken(token);
}

// ============ DAY PROGRESS QUERIES ============

export async function getDayProgress(sessionId: number, dayNumber: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(dayProgress)
    .where(and(eq(dayProgress.sessionId, sessionId), eq(dayProgress.dayNumber, dayNumber)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateDayProgress(
  sessionId: number,
  dayNumber: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let progress = await getDayProgress(sessionId, dayNumber);

  if (!progress) {
    await db.insert(dayProgress).values({
      sessionId,
      dayNumber,
      completed: false,
    });
    progress = await getDayProgress(sessionId, dayNumber);
  }

  return progress;
}

export async function updateDayProgress(
  sessionId: number,
  dayNumber: number,
  data: {
    completed?: boolean;
    completedAt?: Date;
    assumptionOccurred?: boolean;
    repeatedNextDay?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(dayProgress)
    .set(data)
    .where(
      and(
        eq(dayProgress.sessionId, sessionId),
        eq(dayProgress.dayNumber, dayNumber)
      )
    );

  return getDayProgress(sessionId, dayNumber);
}

export async function getAllDayProgress(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(dayProgress)
    .where(eq(dayProgress.sessionId, sessionId));
}

// ============ LEARNING QUERIES ============

export async function createLearning(
  sessionId: number,
  dayNumber: number,
  defaultLearning: string,
  customLearning?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(learnings).values({
    sessionId,
    dayNumber,
    defaultLearning,
    customLearning,
  });
}

export async function getLearningByDay(sessionId: number, dayNumber: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(learnings)
    .where(
      and(
        eq(learnings.sessionId, sessionId),
        eq(learnings.dayNumber, dayNumber)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllLearnings(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(learnings)
    .where(eq(learnings.sessionId, sessionId))
    .orderBy(learnings.dayNumber);
}

// ============ CHECKPOINT QUERIES ============

export async function getCheckpoint(sessionId: number, dayNumber: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(checkpoints)
    .where(
      and(
        eq(checkpoints.sessionId, sessionId),
        eq(checkpoints.dayNumber, dayNumber)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateCheckpoint(
  sessionId: number,
  dayNumber: number,
  data: {
    discovery?: string;
    importantDay?: string;
    feeling?: "more_confident" | "equal" | "confused";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getCheckpoint(sessionId, dayNumber);

  if (existing) {
    await db
      .update(checkpoints)
      .set(data)
      .where(
        and(
          eq(checkpoints.sessionId, sessionId),
          eq(checkpoints.dayNumber, dayNumber)
        )
      );
  } else {
    await db.insert(checkpoints).values({
      sessionId,
      dayNumber,
      ...data,
    });
  }

  return getCheckpoint(sessionId, dayNumber);
}

// ============ CONSENT QUERIES ============

export async function createConsent(
  sessionId: number,
  consentGiven: boolean,
  ipAddress?: string,
  userAgent?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(consents).values({
    sessionId,
    consentGiven,
    ipAddress,
    userAgent,
  });
}

export async function getConsentBySession(sessionId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(consents)
    .where(eq(consents.sessionId, sessionId))
    .orderBy(desc(consents.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ UPDATE SESSION CONSENT ============

export async function updateSessionConsent(sessionId: number, consentGiven: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(sessions)
    .set({
      consentGiven,
      consentDate: new Date(),
    })
    .where(eq(sessions.id, sessionId));
}
