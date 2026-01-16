/**
 * Lógica de liberação de cards baseada em (data_atual - data_inicio)
 * Sempre respeita o relógio às 00h
 */

/**
 * Calcula qual dia da jornada está disponível agora
 * Baseado na diferença entre data atual e data de início
 * @param startDate - Data de início da jornada
 * @returns Número do dia disponível (1-21), ou 0 se antes de começar
 */
export function getAvailableDayNumber(startDate: Date): number {
  const now = new Date();
  const start = new Date(startDate);

  // Normalizar para meia-noite para comparação correta
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  // Calcular diferença em dias
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Dia disponível é diffDays + 1 (no dia de início, dia 1 está disponível)
  const availableDay = diffDays + 1;

  // Limitar a 21 dias
  return Math.min(Math.max(availableDay, 1), 21);
}

/**
 * Verifica se um dia específico está desbloqueado
 * @param dayNumber - Número do dia (1-21)
 * @param startDate - Data de início da jornada
 * @returns true se o dia está desbloqueado, false caso contrário
 */
export function isDayUnlocked(dayNumber: number, startDate: Date): boolean {
  if (dayNumber < 1 || dayNumber > 21) return false;

  const availableDay = getAvailableDayNumber(startDate);
  return dayNumber <= availableDay;
}

/**
 * Calcula o status de um dia
 * @param dayNumber - Número do dia (1-21)
 * @param startDate - Data de início da jornada
 * @param isCompleted - Se o dia foi concluído
 * @returns Status do dia: "available", "locked", "completed"
 */
export function getDayStatus(
  dayNumber: number,
  startDate: Date,
  isCompleted: boolean
): "available" | "locked" | "completed" {
  if (isCompleted) return "completed";
  if (isDayUnlocked(dayNumber, startDate)) return "available";
  return "locked";
}

/**
 * Calcula quantos dias faltam para um dia específico ser desbloqueado
 * @param dayNumber - Número do dia (1-21)
 * @param startDate - Data de início da jornada
 * @returns Número de dias até o desbloqueio (0 se já está desbloqueado)
 */
export function getDaysUntilUnlock(dayNumber: number, startDate: Date): number {
  const availableDay = getAvailableDayNumber(startDate);

  if (dayNumber <= availableDay) return 0;

  return dayNumber - availableDay;
}

/**
 * Obtém a data de desbloqueio de um dia específico
 * @param dayNumber - Número do dia (1-21)
 * @param startDate - Data de início da jornada
 * @returns Data em que o dia será desbloqueado
 */
export function getUnlockDate(dayNumber: number, startDate: Date): Date {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  // Dia 1 é desbloqueado no dia de início
  // Dia 2 é desbloqueado no dia seguinte, etc.
  const daysToAdd = dayNumber - 1;
  const unlockDate = new Date(start);
  unlockDate.setDate(unlockDate.getDate() + daysToAdd);

  return unlockDate;
}

/**
 * Calcula o progresso geral da jornada
 * @param startDate - Data de início da jornada
 * @param completedDays - Array de números dos dias concluídos
 * @returns Objeto com estatísticas de progresso
 */
export function getProgressStats(startDate: Date, completedDays: number[]) {
  const availableDay = getAvailableDayNumber(startDate);
  const totalCompleted = completedDays.length;
  const progressPercentage = Math.round((totalCompleted / 21) * 100);

  return {
    currentDay: availableDay,
    totalCompleted,
    progressPercentage,
    daysRemaining: 21 - totalCompleted,
    isJourneyComplete: availableDay >= 21 && totalCompleted >= 21,
  };
}
