export interface DuplicateEntry {
  registrationId: string;
  rows: number[];
}

export interface ExistingParticipantDuplicate {
  registrationId: string;
  row: number;
}

export interface DuplicateDetectionResult {
  csvDuplicates: DuplicateEntry[];
  existingParticipantDuplicates: ExistingParticipantDuplicate[];
}