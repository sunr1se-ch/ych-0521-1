import db from '../utils/db';
import { PastingRecord } from '../../shared/types';

export function findLastRecordByUmbrellaId(umbrellaId: string): PastingRecord | null {
  const row = db.prepare(`
    SELECT * FROM pasting_record
    WHERE umbrella_id = ?
    ORDER BY pasting_date DESC
    LIMIT 1
  `).get(umbrellaId) as any;

  if (!row) return null;

  return {
    id: row.id,
    umbrellaId: row.umbrella_id,
    pastingDate: row.pasting_date,
    wrinkleLength: row.wrinkle_length,
    intervalDays: row.interval_days,
    wrinkleIncrease: row.wrinkle_increase,
    isStagnantTrigger: Boolean(row.is_stagnant_trigger),
    createdAt: row.created_at,
  };
}

export function createPastingRecord(data: {
  id: string;
  umbrellaId: string;
  pastingDate: string;
  wrinkleLength: number;
  intervalDays: number | null;
  wrinkleIncrease: number | null;
  isStagnantTrigger: boolean;
}): PastingRecord {
  db.prepare(`
    INSERT INTO pasting_record (
      id, umbrella_id, pasting_date, wrinkle_length,
      interval_days, wrinkle_increase, is_stagnant_trigger
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.id,
    data.umbrellaId,
    data.pastingDate,
    data.wrinkleLength,
    data.intervalDays,
    data.wrinkleIncrease,
    data.isStagnantTrigger ? 1 : 0,
  );

  const row = db.prepare('SELECT * FROM pasting_record WHERE id = ?').get(data.id) as any;

  return {
    id: row.id,
    umbrellaId: row.umbrella_id,
    pastingDate: row.pasting_date,
    wrinkleLength: row.wrinkle_length,
    intervalDays: row.interval_days,
    wrinkleIncrease: row.wrinkle_increase,
    isStagnantTrigger: Boolean(row.is_stagnant_trigger),
    createdAt: row.created_at,
  };
}
