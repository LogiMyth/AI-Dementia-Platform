import { describe, expect, it } from "vitest";
describe("foundation", () => it("keeps a safety statement available", () => expect("does not diagnose dementia").toContain("does not diagnose")));
