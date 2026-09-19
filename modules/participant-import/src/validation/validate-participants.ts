import type { ParticipantCsvRow } from "../types/csv";
import type {
  ValidationError,
  ValidationResult,
} from "./validation-result";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN = /^\d{10}$/;

export function validateParticipants(
  rows: ParticipantCsvRow[]
): ValidationResult {
  const validRows: ParticipantCsvRow[] = [];
  const errors: ValidationError[] = [];

  rows.forEach((row, index) => {
    const csvRowNumber = index + 2;
    let rowIsValid = true;

    if (!row.registrationId.trim()) {
      errors.push({
        row: csvRowNumber,
        field: "registrationId",
        message: "Registration ID is required",
      });

      rowIsValid = false;
    }

    if (!row.name.trim()) {
      errors.push({
        row: csvRowNumber,
        field: "name",
        message: "Name is required",
      });

      rowIsValid = false;
    }

    if (!EMAIL_PATTERN.test(row.email.trim())) {
      errors.push({
        row: csvRowNumber,
        field: "email",
        message: "Invalid email address",
      });

      rowIsValid = false;
    }

    if (!PHONE_PATTERN.test(row.phone.trim())) {
      errors.push({
        row: csvRowNumber,
        field: "phone",
        message: "Phone number must contain exactly 10 digits",
      });

      rowIsValid = false;
    }

    if (!row.college.trim()) {
      errors.push({
        row: csvRowNumber,
        field: "college",
        message: "College is required",
      });

      rowIsValid = false;
    }

    if (!row.department.trim()) {
      errors.push({
        row: csvRowNumber,
        field: "department",
        message: "Department is required",
      });

      rowIsValid = false;
    }

    if (!row.section.trim()) {
      errors.push({
        row: csvRowNumber,
        field: "section",
        message: "Section is required",
      });

      rowIsValid = false;
    }

    const year = Number(row.year);

    if (!Number.isInteger(year) || year <= 0) {
      errors.push({
        row: csvRowNumber,
        field: "year",
        message: "Year must be a positive whole number",
      });

      rowIsValid = false;
    }

    if (rowIsValid) {
      validRows.push(row);
    }
  });

  return {
    validRows,
    errors,
  };
}