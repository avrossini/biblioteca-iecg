import { describe, it, expect } from "vitest";
import { sanitizarResumo } from "@/lib/sanitize";

describe("sanitizarResumo", () => {
  it("remove tags perigosas (script)", () => {
    const r = sanitizarResumo("<p>ok</p><script>alert(1)</script>");
    expect(r).not.toContain("<script");
    expect(r).toContain("ok");
  });

  it("mantém formatação permitida", () => {
    const r = sanitizarResumo("<p><strong>oi</strong> <em>e</em></p>");
    expect(r).toContain("<strong>");
    expect(r).toContain("<em>");
  });

  it("trata vazio/nulo", () => {
    expect(sanitizarResumo(null)).toBe("");
    expect(sanitizarResumo(undefined)).toBe("");
  });
});
