import { allServices, getService } from "./services";
import { SERVICES } from "./services.config";

describe("allServices", () => {
  it("returns all configured services", () => {
    const list = allServices();
    expect(list).toHaveLength(Object.keys(SERVICES).length);
  });

  it("maps each service key to the same config object", () => {
    const [first] = allServices();
    expect(first).toEqual({
      slug: first.slug,
      config: SERVICES[first.slug],
    });
  });
});

describe("getService", () => {
  it("returns service by valid slug", () => {
    expect(getService("web")).toEqual({
      slug: "web",
      config: SERVICES.web,
    });
  });

  it("returns null for unknown slug", () => {
    expect(getService("unknown-service")).toBeNull();
  });
});
