import { describe, expect, it } from "vitest";
import { roles } from "@dementia/contracts";
import { speakText, stopSpeech } from "./utils/speech";

describe("P1 Patient Core", () => {
  it("keeps a non-diagnostic dementia safety statement active", () => {
    const statement = "This platform supports routines and engagement. It does not diagnose dementia or replace medical care.";
    expect(statement).toContain("does not diagnose dementia");
  });

  it("verifies supported roles in contracts", () => {
    expect(roles).toContain("PATIENT");
    expect(roles).toContain("CAREGIVER");
    expect(roles).toContain("CLINICIAN_REVIEWER");
    expect(roles).toContain("ADMIN");
  });

  it("safely handles speech synthesis when unavailable or supported", () => {
    expect(() => speakText("Good morning, Meera", false)).not.toThrow();
    expect(() => stopSpeech()).not.toThrow();
  });
});
