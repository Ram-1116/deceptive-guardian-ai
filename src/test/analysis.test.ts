import { describe, expect, it } from "vitest";
import { analyzeSample, analyzeUrl, bandFor, redactUrl, isValidUrl } from "@/lib/analysis";

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
    expect(redactUrl("https://a.example/x?otp=123456").redacted).toBe("https://a.example/x");
  });
  it("custom URLs are URL-only", () => {
    expect(analyzeUrl("example.com").mode).toBe("url-only");
  });
});


describe("Signal coverage and privacy", () => {
  it("URL-only manipulation is zero even with sensitive and urgent URL tokens", () => {
    const r = analyzeUrl("https://urgent-reward.example/otp/password");
    expect(r.manipulation).toBe(0);
    expect(r.factors.every(f => !f.available && f.matches.length === 0)).toBe(true);
    expect(r.indicators.filter(i => i.group !== "URL / domain").every(i => !i.available)).toBe(true);
    expect(r).not.toHaveProperty("confidence");
  });
  it("sanitizes credentials, query tokens and fragments", () => {
    const r = analyzeUrl("https://user:secret@a.example/path?otp=123456#password");
    expect(r.input).toBe("https://a.example/path");
    expect(JSON.stringify(r)).not.toContain("123456");
    expect(JSON.stringify(r)).not.toContain("secret");
  });
  it("query strings and fragments do not change risk", () => {
    const base = analyzeUrl("https://a.example/path", undefined, 1);
    const token = analyzeUrl("https://a.example/path?otp=" + "1".repeat(120) + "#password@evil", undefined, 1);
    expect(token).toEqual(base);
  });
  it("HTTPS alone neither proves malice nor raises the score", () => {
    expect(analyzeUrl("https://a.example").score).toBe(0);
    expect(analyzeUrl("http://a.example").score).toBe(8);
  });
  it("missing partial page fields are unavailable, not inspected clear", () => {
    const r = analyzeUrl("https://a.example", { id: "safe", label: "Partial sample", url: "https://a.example", page: { visibleText: "urgent password" } });
    expect(r.factors.every(f => f.available)).toBe(true);
    expect(r.indicators.find(i => i.id === "otp-field")?.available).toBe(false);
    expect(r.indicators.find(i => i.id === "visual")?.available).toBe(false);
  });
  it("all scenario scores are deterministic and bounded 0–100", () => {
    for (const id of ["safe", "login-clone", "otp-scam"] as const) {
      const r = analyzeSample(id, 1);
      expect(r).toEqual(analyzeSample(id, 1));
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });
  it("rejects non-http schemes and invalid inputs", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("not a url")).toBe(false);
    expect(() => analyzeUrl("ftp://a.example")).toThrow();
  });
});
