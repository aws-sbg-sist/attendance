import type { TokenGateState } from "@attendance/checkin-experience";

export const GATE_COOKIE_NAME: string;

export function createGateCookie(
  eventSlug: string,
  state: Exclude<TokenGateState, "missing">,
  maxAgeSeconds: number,
): string;

export function readGateCookie(
  value: string | undefined,
  expectedEventSlug: string,
): TokenGateState;
