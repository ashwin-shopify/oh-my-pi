import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(TEST_DIR, "..");

export async function readRepoText(relativePath: string): Promise<string> {
  return readFile(join(ROOT_DIR, relativePath), "utf-8");
}

export function assertIncludesAll(text: string, needles: string[]): void {
  for (const needle of needles) {
    assert.ok(text.includes(needle), `Expected text to include: ${needle}`);
  }
}

export function assertIncludesAny(text: string, needles: string[]): void {
  assert.ok(
    needles.some((needle) => text.includes(needle)),
    `Expected text to include one of: ${needles.join(", ")}`,
  );
}
