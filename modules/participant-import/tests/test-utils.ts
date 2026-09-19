export function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(`Test failed: ${message}`);
  }
}

export function assertEqual<T>(
  actual: T,
  expected: T,
  message: string
): void {
  if (actual !== expected) {
    throw new Error(
      `Test failed: ${message}\nExpected: ${expected}\nActual: ${actual}`
    );
  }
}

export function assertDeepEqual(
  actual: unknown,
  expected: unknown,
  message: string
): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Test failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
    );
  }
}