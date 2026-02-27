import { THEMES, themeFromSlug } from "./theme";

describe("themeFromSlug", () => {
  it("returns default theme for empty slug", () => {
    expect(themeFromSlug("")).toBe("service-web");
  });

  it("is deterministic for the same slug", () => {
    const slug = "landing-page";
    expect(themeFromSlug(slug)).toBe(themeFromSlug(slug));
  });

  it("returns one of supported theme classes", () => {
    expect(THEMES).toContain(themeFromSlug("any-slug"));
  });
});
