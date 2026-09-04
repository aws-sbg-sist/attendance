import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const requiredPaths = [
  "apps/web",
  "apps/api",
  "modules/participant-import",
  "modules/checkin-experience",
  "modules/token-security",
  "modules/attendance-admin",
  "packages/ui",
  "packages/contracts",
  "packages/validation",
  "docs/api.md",
  "docs/data-model.md",
  "docs/operations.md",
  "fixtures",
  ".env.example",
  "README.md",
];

test("the PDF-defined repository structure exists", async () => {
  await Promise.all(requiredPaths.map((path) => access(path)));
});

test("root scripts expose the portable workflow", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));

  assert.equal(packageJson.scripts.dev, "npm run dev --workspace=@attendance/web");
  assert.equal(packageJson.scripts.build, "npm run build --workspace=@attendance/web");
  assert.equal(packageJson.scripts.test, "node --test tests/*.test.mjs");
});
