import { writeFileSync } from "fs";
import type { Change } from "~/types";

/**
 * Apply the file changes.
 *
 * @param changes The file changes to apply.
 */
export function applyChanges(changes: Change[]) {
  changes.forEach(({ file, text }) => {
    writeFileSync(file, text, { encoding: "utf-8" });
  });
}
