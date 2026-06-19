import { getDb } from '@/data/db';

export async function completedPlanDays(planId: string): Promise<Set<number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ day_index: number }>(
    'SELECT day_index FROM plan_progress WHERE plan_id = ?',
    [planId],
  );
  return new Set(rows.map((r) => r.day_index));
}

export async function setPlanDayCompleted(
  planId: string,
  dayIndex: number,
  completed: boolean,
): Promise<void> {
  const db = await getDb();
  if (completed) {
    await db.runAsync(
      `INSERT INTO plan_progress (plan_id, day_index, completed_at) VALUES (?, ?, ?)
       ON CONFLICT(plan_id, day_index) DO NOTHING`,
      [planId, dayIndex, new Date().toISOString()],
    );
  } else {
    await db.runAsync('DELETE FROM plan_progress WHERE plan_id = ? AND day_index = ?', [
      planId,
      dayIndex,
    ]);
  }
}
