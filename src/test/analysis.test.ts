import { describe, expect, it } from "vitest";
import { analyzeSample, analyzeUrl, bandFor, redactUrl } from "@/lib/analysis";

describe("DeceptIQ demo scoring", () => {
  it("bands follow 30/55/75 thresholds", () => {
    expect(bandFor(29)).toBe("Low");
    expect(bandFor(30)).toBe("Elevated");
    expect(bandFor(55)).toBe("High");
    expect(bandFor(75)).toBe("Critical");
  });
  it("safe sample is Low", () => {
    expect(analyzeSample("safe").band).toBe("Low");
  });
  it("login clone is Critical with credential theft", () => {
    const r = analyzeSample("login-clone");
    expect(r.band).toBe("Critical");
    expect(r.primaryIntent).toBe("Credential theft");
  });
  it("OTP scam flags OTP harvesting or payment fraud at High or above", () => {
    const r = analyzeSample("otp-scam");
    expect(["High", "Critical"]).toContain(r.band);
    expect(["OTP harvesting", "Payment fraud"]).toContain(r.primaryIntent);
  });
  it("score equals technical + 0.3 * manipulation", () => {
    const r = analyzeSample("otp-scam");
    expect(r.score).toBe(Math.min(100, Math.round(r.technical + 0.3 * r.manipulation)));
  });
  it("redacts query strings", () => {
    expect(redactUrl("https://a.example/x?otp=123456").redacted).toBe("https://a.example/x?[query removed]");
  });
  it("custom URLs are URL-only", () => {
    expect(analyzeUrl("example.com").mode).toBe("url-only");
  });
});
