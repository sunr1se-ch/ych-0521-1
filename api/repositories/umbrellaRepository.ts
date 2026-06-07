import db from '../utils/db';
import { Umbrella, UmbrellaStatus, UmbrellaListItem, UmbrellaDetail } from '../../shared/types';

export function findAllUmbrellas(status?: string, search?: string): UmbrellaListItem[] {
  let sql = `
    SELECT DISTINCT u.*,
      (SELECT MAX(pasting_date) FROM pasting_record pr WHERE pr.umbrella_id = u.id) as last_pasting_date,
      (SELECT COUNT(*) FROM pasting_record pr WHERE pr.umbrella_id = u.id) as pasting_count
    FROM umbrella u
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    sql += ' AND u.status = ?';
    params.push(status);
  }

  if (search) {
    sql += ' AND u.umbrella_no LIKE ?';
    params.push(`%${search}%`);
  }

  sql += ' ORDER BY u.created_at DESC';

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map(row => {
    const stagnation = findCurrentStagnation(row.id);
    return {
      id: row.id,
      umbrellaNo: row.umbrella_no,
      plannedIntervalDays: row.planned_interval_days,
      status: row.status as UmbrellaStatus,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      completionNote: row.completion_note,
      lastPastingDate: row.last_pasting_date,
      pastingCount: row.pasting_count,
      currentStagnation: stagnation,
    };
  });
}

export function findUmbrellaByNo(umbrellaNo: string): Umbrella | null {
  const row = db.prepare('SELECT * FROM umbrella WHERE umbrella_no = ?').get(umbrellaNo) as any;
  if (!row) return null;

  return {
    id: row.id,
    umbrellaNo: row.umbrella_no,
    plannedIntervalDays: row.planned_interval_days,
    status: row.status as UmbrellaStatus,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    completionNote: row.completion_note,
  };
}

export function findUmbrellaById(id: string): UmbrellaDetail | null {
  const row = db.prepare('SELECT * FROM umbrella WHERE id = ?').get(id) as any;
  if (!row) return null;

  const records = db.prepare(`
    SELECT * FROM pasting_record
    WHERE umbrella_id = ?
    ORDER BY pasting_date DESC
  `).all(id) as any[];

  const stagnations = db.prepare(`
    SELECT * FROM stagnation_record
    WHERE umbrella_id = ?
    ORDER BY created_at DESC
  `).all(id) as any[];

  return {
    id: row.id,
    umbrellaNo: row.umbrella_no,
    plannedIntervalDays: row.planned_interval_days,
    status: row.status as UmbrellaStatus,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    completionNote: row.completion_note,
    records: records.map(r => ({
      id: r.id,
      umbrellaId: r.umbrella_id,
      pastingDate: r.pasting_date,
      wrinkleLength: r.wrinkle_length,
      intervalDays: r.interval_days,
      wrinkleIncrease: r.wrinkle_increase,
      isStagnantTrigger: Boolean(r.is_stagnant_trigger),
      createdAt: r.created_at,
    })),
    stagnations: stagnations.map(s => ({
      id: s.id,
      umbrellaId: s.umbrella_id,
      triggeredByRecordId: s.triggered_by_record_id,
      reason: s.reason,
      stagnantDate: s.stagnant_date,
      resolved: Boolean(s.resolved),
      resolvedAt: s.resolved_at,
      resolutionNote: s.resolution_note,
      createdAt: s.created_at,
    })),
  };
}

export function findCurrentStagnation(umbrellaId: string) {
  const row = db.prepare(`
    SELECT * FROM stagnation_record
    WHERE umbrella_id = ? AND resolved = 0
    ORDER BY created_at DESC
    LIMIT 1
  `).get(umbrellaId) as any;

  if (!row) return null;

  return {
    id: row.id,
    umbrellaId: row.umbrella_id,
    triggeredByRecordId: row.triggered_by_record_id,
    reason: row.reason,
    stagnantDate: row.stagnant_date,
    resolved: Boolean(row.resolved),
    resolvedAt: row.resolved_at,
    resolutionNote: row.resolution_note,
    createdAt: row.created_at,
  };
}

export function createUmbrella(data: { id: string; umbrellaNo: string; plannedIntervalDays: number }): Umbrella {
  db.prepare(`
    INSERT INTO umbrella (id, umbrella_no, planned_interval_days, status)
    VALUES (?, ?, ?, 'normal')
  `).run(data.id, data.umbrellaNo, data.plannedIntervalDays);

  return findUmbrellaById(data.id)!;
}

export function updateUmbrellaStatus(id: string, status: UmbrellaStatus, completedAt?: string, completionNote?: string): void {
  if (completedAt) {
    db.prepare('UPDATE umbrella SET status = ?, completed_at = ?, completion_note = ? WHERE id = ?')
      .run(status, completedAt, completionNote || null, id);
  } else {
    db.prepare('UPDATE umbrella SET status = ? WHERE id = ?').run(status, id);
  }
}
