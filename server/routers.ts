import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getSessionByToken,
  createSession,
  getDayProgress,
  getOrCreateDayProgress,
  updateDayProgress,
  getAllDayProgress,
  createLearning,
  getLearningByDay,
  getAllLearnings,
  getCheckpoint,
  createOrUpdateCheckpoint,
  createConsent,
  getConsentBySession,
  updateSessionConsent,
} from "./db";
import { getDayData, DAYS } from "@shared/days";
import {
  getAvailableDayNumber,
  isDayUnlocked,
  getDayStatus,
  getDaysUntilUnlock,
  getUnlockDate,
  getProgressStats,
} from "./dayLogic";
import { TRPCError } from "@trpc/server";

// ============ CONTEXT EXTENSION ============

export interface SessionContext {
  sessionId: number;
  userId: number;
  startDate: Date;
}

// ============ ROUTERS ============

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ SESSION ROUTES ============

  session: router({
    /**
     * Autenticar via token na URL
     * Cria ou obtém uma sessão baseada no token
     */
    authenticate: publicProcedure
      .input(
        z.object({
          token: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const session = await getSessionByToken(input.token);

        if (!session) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Token inválido ou expirado",
          });
        }

        return {
          sessionId: session.id,
          userId: session.userId,
          startDate: session.startDate,
          consentGiven: session.consentGiven,
        };
      }),
  }),

  // ============ DAY ROUTES ============

  days: router({
    /**
     * Obter informações do dia atual e todos os dias
     */
    getAll: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          startDate: z.date(),
        })
      )
      .query(async ({ input }) => {
        const availableDay = getAvailableDayNumber(input.startDate);
        const allProgress = await getAllDayProgress(input.sessionId);

        const completedDayNumbers = allProgress
          .filter((p) => p.completed)
          .map((p) => p.dayNumber);

        const daysData = DAYS.map((day) => {
          const progress = allProgress.find((p) => p.dayNumber === day.day);
          const status = getDayStatus(
            day.day,
            input.startDate,
            progress?.completed || false
          );
          const daysUntilUnlock = getDaysUntilUnlock(day.day, input.startDate);
          const unlockDate = getUnlockDate(day.day, input.startDate);

          return {
            ...day,
            status,
            daysUntilUnlock,
            unlockDate,
            isCompleted: progress?.completed || false,
            assumptionOccurred: progress?.assumptionOccurred,
            repeatedNextDay: progress?.repeatedNextDay || false,
          };
        });

        const stats = getProgressStats(input.startDate, completedDayNumbers);

        return {
          days: daysData,
          currentDay: availableDay,
          stats,
        };
      }),

    /**
     * Obter dados de um dia específico
     */
    getDay: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          dayNumber: z.number().min(1).max(21),
          startDate: z.date(),
        })
      )
      .query(async ({ input }) => {
        const dayData = getDayData(input.dayNumber);

        if (!dayData) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Dia não encontrado",
          });
        }

        const progress = await getOrCreateDayProgress(
          input.sessionId,
          input.dayNumber
        );
        const isUnlocked = isDayUnlocked(input.dayNumber, input.startDate);
        const status = getDayStatus(
          input.dayNumber,
          input.startDate,
          progress?.completed || false
        );

        return {
          ...dayData,
          status,
          isUnlocked,
          isCompleted: progress?.completed || false,
          assumptionOccurred: progress?.assumptionOccurred,
          repeatedNextDay: progress?.repeatedNextDay || false,
          daysUntilUnlock: getDaysUntilUnlock(input.dayNumber, input.startDate),
          unlockDate: getUnlockDate(input.dayNumber, input.startDate),
        };
      }),

    /**
     * Registrar resposta à pergunta "A suposição ocorreu?"
     */
    recordAssumption: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          dayNumber: z.number().min(1).max(21),
          assumptionOccurred: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        await updateDayProgress(input.sessionId, input.dayNumber, {
          assumptionOccurred: input.assumptionOccurred,
        });

        return { success: true };
      }),

    /**
     * Registrar se o usuário quer repetir a missão
     */
    recordRepeatChoice: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          dayNumber: z.number().min(1).max(21),
          repeatNextDay: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        if (!input.repeatNextDay) {
          // Se não quer repetir, marcar como concluído
          await updateDayProgress(input.sessionId, input.dayNumber, {
            completed: true,
            completedAt: new Date(),
            repeatedNextDay: false,
          });
        } else {
          // Se quer repetir, manter aberto
          await updateDayProgress(input.sessionId, input.dayNumber, {
            repeatedNextDay: true,
          });
        }

        return { success: true };
      }),

    /**
     * Concluir um dia com aprendizado
     */
    completeDay: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          dayNumber: z.number().min(1).max(21),
          customLearning: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const dayData = getDayData(input.dayNumber);

        if (!dayData) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Dia não encontrado",
          });
        }

        // Registrar aprendizado
        await createLearning(
          input.sessionId,
          input.dayNumber,
          dayData.defaultLearning,
          input.customLearning
        );

        // Marcar dia como concluído
        await updateDayProgress(input.sessionId, input.dayNumber, {
          completed: true,
          completedAt: new Date(),
          repeatedNextDay: false,
        });

        return { success: true };
      }),
  }),

  // ============ LEARNING ROUTES ============

  learnings: router({
    /**
     * Obter todos os aprendizados
     */
    getAll: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
        })
      )
      .query(async ({ input }) => {
        return getAllLearnings(input.sessionId);
      }),

    /**
     * Obter aprendizado de um dia específico
     */
    getByDay: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          dayNumber: z.number().min(1).max(21),
        })
      )
      .query(async ({ input }) => {
        return getLearningByDay(input.sessionId, input.dayNumber);
      }),
  }),

  // ============ CHECKPOINT ROUTES ============

  checkpoints: router({
    /**
     * Obter checkpoint de um dia específico
     */
    get: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          dayNumber: z.number().refine((d) => [8, 15, 21].includes(d)),
        })
      )
      .query(async ({ input }) => {
        return getCheckpoint(input.sessionId, input.dayNumber);
      }),

    /**
     * Criar ou atualizar checkpoint
     */
    save: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          dayNumber: z.number().refine((d) => [8, 15, 21].includes(d)),
          discovery: z.string().optional(),
          importantDay: z.string().optional(),
          feeling: z
            .enum(["more_confident", "equal", "confused"])
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { sessionId, dayNumber, ...data } = input;

        await createOrUpdateCheckpoint(sessionId, dayNumber, data);

        return { success: true };
      }),
  }),

  // ============ CONSENT ROUTES ============

  consent: router({
    /**
     * Registrar consentimento do usuário
     */
    save: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          consentGiven: z.boolean(),
          ipAddress: z.string().optional(),
          userAgent: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { sessionId, consentGiven, ipAddress, userAgent } = input;

        // Registrar consentimento
        await createConsent(sessionId, consentGiven, ipAddress, userAgent);

        // Atualizar sessão
        await updateSessionConsent(sessionId, consentGiven);

        return { success: true };
      }),

    /**
     * Obter consentimento atual
     */
    get: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
        })
      )
      .query(async ({ input }) => {
        return getConsentBySession(input.sessionId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
