export type UmbrellaStatus = 'normal' | 'stagnant' | 'completed';

export interface Umbrella {
  id: string;
  umbrellaNo: string;
  plannedIntervalDays: number;
  status: UmbrellaStatus;
  createdAt: string;
  completedAt: string | null;
  completionNote: string | null;
}

export interface PastingRecord {
  id: string;
  umbrellaId: string;
  pastingDate: string;
  wrinkleLength: number;
  intervalDays: number | null;
  wrinkleIncrease: number | null;
  isStagnantTrigger: boolean;
  createdAt: string;
}

export interface StagnationRecord {
  id: string;
  umbrellaId: string;
  triggeredByRecordId: string;
  reason: string;
  stagnantDate: string;
  resolved: boolean;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface UmbrellaListItem extends Umbrella {
  lastPastingDate: string | null;
  pastingCount: number;
  currentStagnation: StagnationRecord | null;
}

export interface UmbrellaDetail extends Umbrella {
  records: PastingRecord[];
  stagnations: StagnationRecord[];
}

export interface StagnationWithUmbrella extends StagnationRecord {
  umbrella: Umbrella;
}

export interface CreatePastingRecordRequest {
  pastingDate: string;
  wrinkleLength: number;
}

export interface CreatePastingRecordResponse {
  record: PastingRecord;
  stagnation?: StagnationRecord;
}

export interface CreateUmbrellaRequest {
  umbrellaNo: string;
  plannedIntervalDays: number;
}

export interface ResolveStagnationRequest {
  resolutionNote: string;
}

export interface CompleteUmbrellaRequest {
  completedDate: string;
  note?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
