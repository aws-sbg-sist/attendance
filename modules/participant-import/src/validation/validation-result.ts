import type { ParticipantCsvRow } from "../types/csv";

export interface ValidationError {
  row: number;
  field: keyof ParticipantCsvRow;
  message: string;
}

export interface ValidationResult {
  validRows: ParticipantCsvRow[];
  errors: ValidationError[];
}