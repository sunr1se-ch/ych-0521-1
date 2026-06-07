import * as umbrellaRepo from '../repositories/umbrellaRepository';
import * as pastingRepo from '../repositories/pastingRecordRepository';
import * as stagnationRepo from '../repositories/stagnationRecordRepository';
import { generateId } from '../utils/id';
import { daysBetween, getCurrentDateTime } from '../utils/date';
import {
  Umbrella,
  UmbrellaDetail,
  UmbrellaListItem,
  PastingRecord,
  StagnationRecord,
  StagnationWithUmbrella,
  CreatePastingRecordResponse,
} from '../../shared/types';

export function getAllUmbrellas(status?: string, search?: string): UmbrellaListItem[] {
  return umbrellaRepo.findAllUmbrellas(status, search);
}

export function getUmbrellaDetail(id: string): UmbrellaDetail | null {
  return umbrellaRepo.findUmbrellaById(id);
}

export function createUmbrella(umbrellaNo: string, plannedIntervalDays: number): Umbrella {
  const id = generateId('u');
  return umbrellaRepo.createUmbrella({ id, umbrellaNo, plannedIntervalDays });
}

export function addPastingRecord(
  umbrellaId: string,
  pastingDate: string,
  wrinkleLength: number,
): CreatePastingRecordResponse {
  const umbrella = umbrellaRepo.findUmbrellaById(umbrellaId);
  if (!umbrella) {
    throw new Error('伞号不存在');
  }

  if (umbrella.status === 'completed') {
    throw new Error('该伞已完工，无法继续裱糊');
  }

  const lastRecord = pastingRepo.findLastRecordByUmbrellaId(umbrellaId);
  let intervalDays: number | null = null;
  let wrinkleIncrease: number | null = null;
  let isStagnantTrigger = false;

  if (lastRecord) {
    intervalDays = daysBetween(lastRecord.pastingDate, pastingDate);
    wrinkleIncrease = Math.round((wrinkleLength - lastRecord.wrinkleLength) * 10) / 10;

    const plannedInterval = umbrella.plannedIntervalDays;
    if (intervalDays >= plannedInterval + 2 && wrinkleIncrease >= 3) {
      isStagnantTrigger = true;
    }
  }

  const recordId = generateId('p');
  const record = pastingRepo.createPastingRecord({
    id: recordId,
    umbrellaId,
    pastingDate,
    wrinkleLength,
    intervalDays,
    wrinkleIncrease,
    isStagnantTrigger,
  });

  let stagnation: StagnationRecord | undefined;
  if (isStagnantTrigger) {
    const stagnationId = generateId('s');
    const reason = `实际间隔${intervalDays}天超出计划${umbrella.plannedIntervalDays}天+2天，起皱增加${wrinkleIncrease}cm超出3cm阈值`;
    stagnation = stagnationRepo.createStagnationRecord({
      id: stagnationId,
      umbrellaId,
      triggeredByRecordId: recordId,
      reason,
      stagnantDate: pastingDate,
    });
    umbrellaRepo.updateUmbrellaStatus(umbrellaId, 'stagnant');
  }

  return { record, stagnation };
}

export function getAllStagnations(resolved?: boolean): StagnationWithUmbrella[] {
  return stagnationRepo.findAllStagnations(resolved);
}

export function resolveStagnation(stagnationId: string, resolutionNote: string): StagnationRecord {
  const stagnations = stagnationRepo.findAllStagnations(false);
  const stagnation = stagnations.find(s => s.id === stagnationId);

  if (!stagnation) {
    throw new Error('停滞记录不存在或已解除');
  }

  const resolvedAt = getCurrentDateTime();
  const result = stagnationRepo.resolveStagnation(stagnationId, resolutionNote, resolvedAt);

  if (!result) {
    throw new Error('解除停滞失败');
  }

  const remainingStagnations = stagnationRepo.findAllStagnations(false);
  const hasOtherStagnation = remainingStagnations.some(s => s.umbrellaId === stagnation.umbrellaId);

  if (!hasOtherStagnation) {
    umbrellaRepo.updateUmbrellaStatus(stagnation.umbrellaId, 'normal');
  }

  return result;
}

export function completeUmbrella(umbrellaId: string, completedDate: string): Umbrella {
  const umbrella = umbrellaRepo.findUmbrellaById(umbrellaId);
  if (!umbrella) {
    throw new Error('伞号不存在');
  }

  if (umbrella.status === 'completed') {
    throw new Error('该伞已完工');
  }

  if (umbrella.status === 'stagnant') {
    throw new Error('该伞处于停滞状态，请先解除停滞再登记完工');
  }

  umbrellaRepo.updateUmbrellaStatus(umbrellaId, 'completed', completedDate);

  const updated = umbrellaRepo.findUmbrellaById(umbrellaId);
  if (!updated) {
    throw new Error('更新状态失败');
  }

  return updated;
}
