export interface Participant {
  id: string;
  eventId: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  section: string;
  year: number;
  customFields: Record<string, unknown>;
  status: string;
}
