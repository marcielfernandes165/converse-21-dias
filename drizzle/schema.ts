import {
  serial,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * Enums para PostgreSQL
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const feelingEnum = pgEnum("feeling", ["more_confident", "equal", "confused"]);

/**
 * Usuários do sistema
 * Identificados por token, sem login com senha
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Sessões de usuário com token
 * Permite acesso via token na URL sem login
 */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  startDate: timestamp("startDate").defaultNow().notNull(), // Data de início da jornada
  consentGiven: boolean("consentGiven").default(false).notNull(),
  consentDate: timestamp("consentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Progresso diário do usuário
 * Rastreia qual dia foi concluído e quando
 */
export const dayProgress = pgTable("dayProgress", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  dayNumber: integer("dayNumber").notNull(), // 1-21
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  assumptionOccurred: boolean("assumptionOccurred"), // SIM/NÃO na pergunta
  repeatedNextDay: boolean("repeatedNextDay").default(false).notNull(), // Se usuário escolheu repetir
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DayProgress = typeof dayProgress.$inferSelect;
export type InsertDayProgress = typeof dayProgress.$inferInsert;

/**
 * Aprendizados registrados pelo usuário
 * Armazenados cronologicamente para a aba de aprendizados
 */
export const learnings = pgTable("learnings", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  dayNumber: integer("dayNumber").notNull(), // 1-21
  defaultLearning: text("defaultLearning").notNull(), // Aprendizado pré-pronto
  customLearning: text("customLearning"), // Aprendizado opcional do usuário
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Learning = typeof learnings.$inferSelect;
export type InsertLearning = typeof learnings.$inferInsert;

/**
 * Checkpoints nos dias 8, 15 e 21
 * Armazena respostas estruturadas do usuário
 */
export const checkpoints = pgTable("checkpoints", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  dayNumber: integer("dayNumber").notNull(), // 8, 15 ou 21
  discovery: text("discovery"), // "O que você descobriu através dos aprendizados?"
  importantDay: text("importantDay"), // "Qual dia foi mais importante?"
  feeling: feelingEnum("feeling"), // "Você se sente:"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Checkpoint = typeof checkpoints.$inferSelect;
export type InsertCheckpoint = typeof checkpoints.$inferInsert;

/**
 * Consentimento de dados
 * Rastreia consentimento do usuário para uso anônimo de dados
 */
export const consents = pgTable("consents", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  consentGiven: boolean("consentGiven").default(false).notNull(),
  consentDate: timestamp("consentDate").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 ou IPv6
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Consent = typeof consents.$inferSelect;
export type InsertConsent = typeof consents.$inferInsert;
