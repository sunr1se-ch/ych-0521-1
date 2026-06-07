import db from '../utils/db';
import { StagnationRecord, StagnationWithUmbrella } from '../../shared/types';

export function findAllStagnations(resolved?: boolean): StagnationWithUmbrella[] {
  let sql = `
    SELECT s.*, u.id as u_id, u.umbrella_no, u.planned_interval_days, u.status, u.created_at as u_created_at, u.completed_at
    FROM stagnation_record s
    JOIN umbrella u ON s.umbrella_id = u.id
  `;
  const params: any[] = [];

  if (resolved !== undefined) {
    sql += ' WHERE s.resolved = ?';
    params.push(resolved ? 1 : 0);
  }

  sql += ' ORDER BY s.created_at DESC';

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map(row => ({
    id: row.id,
    umbrellaId: row.umbrella_id,
    triggeredByRecordId: row.triggered_by_record_id,
    reason: row.reason,
    stagnantDate: row.stagnant_date,
    resolved: Boolean(row.resolved),
    resolvedAt: row.resolved_at,
    resolutionNote: row.resolution_note,
    createdAt: row.created_at,
    umbrella: {
      id: row.u_id,
      umbrellaNo: row.umbrella_no,
      plannedIntervalDays: row.planned_interval_days,
      status: row.status,
      createdAt: row.u_created_at,
      completedAt: row.completed_at,
    },
  }));
}

export function createStagnationRecord(data: {
  id: string;
  umbrellaId: string;
  triggeredByRecordId: string;
  reason: string;
  stagnantDate: string;
}): StagnationRecord {
  db.prepare(`
    INSERT INTO stagnation_record (
      id, umbrella_id, triggered_by_record_id, reason, stagnant_date
    ) VALUES (?, ?, ?, ?, ?)
  `).run(data.id, data.umbrellaId, data.triggeredByRecordId, data.reason, data.stagnantDate);

  const row = db.prepare('SELECT * FROM stagnation_record WHERE id = ?').get(data.id) as any;

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

export function resolveStagnation(id: string, resolutionNote: string, resolvedAt: string): StagnationRecord | null {
  db.prepare(`
    UPDATE stagnation_record
    SET resolved = 1, resolved_at = ?, resolution_note = ?
    WHERE id = ?
  `).run(resolvedAt, resolutionNote, id);

  const row = db.prepare('SELECT * FROM stagnation_record WHERE id = ?').get(id) as any;
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
