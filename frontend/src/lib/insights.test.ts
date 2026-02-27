import type { Insight } from "./insights";

type InsightsModule = typeof import("./insights");

type MockResponseOptions<T> = {
  ok: boolean;
  status: number;
  jsonData?: T;
  textData?: string;
};

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = global.fetch;

function createMockResponse<T>({
  ok,
  status,
  jsonData,
  textData = "",
}: MockResponseOptions<T>): Response {
  return {
    ok,
    status,
    json: jest.fn(async () => jsonData),
    text: jest.fn(async () => textData),
  } as unknown as Response;
}

async function loadInsightsModule(
  envOverrides: Partial<NodeJS.ProcessEnv> = {}
): Promise<InsightsModule> {
  jest.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    BACKEND_URL: "https://api.test",
    ...envOverrides,
  };
  return import("./insights");
}

function fetchMock(): jest.MockedFunction<typeof fetch> {
  return global.fetch as unknown as jest.MockedFunction<typeof fetch>;
}

function makeInsight(slug: string, date: string): Insight {
  return {
    slug,
    title: `Title ${slug}`,
    excerpt: "Excerpt",
    cover: "/cover.png",
    date,
    readTime: "6 min",
    tags: ["design"],
  };
}

beforeEach(() => {
  global.fetch = jest.fn() as unknown as typeof fetch;
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
  global.fetch = ORIGINAL_FETCH;
});

describe("getAllInsights", () => {
  it("loads and sorts insights by date desc, with public auth header", async () => {
    const insights = await loadInsightsModule({
      PUBLIC_API_KEY: "pub-token",
      ADMIN_TOKEN: "admin-token",
    });

    fetchMock().mockResolvedValueOnce(
      createMockResponse({
        ok: true,
        status: 200,
        jsonData: [
          makeInsight("a", "2024-03-01"),
          makeInsight("b", "2023-01-01"),
          makeInsight("c", "2025-02-01"),
        ],
      })
    );

    const result = await insights.getAllInsights();

    expect(result.map((item) => item.slug)).toEqual(["c", "a", "b"]);
    expect(fetchMock()).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/insights");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer pub-token"
    );
  });

  it("omits Authorization header when there are no tokens", async () => {
    const insights = await loadInsightsModule({
      PUBLIC_API_KEY: "",
      ADMIN_TOKEN: "",
    });

    fetchMock().mockResolvedValueOnce(
      createMockResponse({ ok: true, status: 200, jsonData: [] as Insight[] })
    );

    await insights.getAllInsights();

    const [, init] = fetchMock().mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("throws when backend response is not ok", async () => {
    const insights = await loadInsightsModule();
    fetchMock().mockResolvedValueOnce(createMockResponse({ ok: false, status: 500 }));

    await expect(insights.getAllInsights()).rejects.toThrow("Failed to load insights");
  });
});

describe("getInsight", () => {
  it("returns null for 404", async () => {
    const insights = await loadInsightsModule();
    fetchMock().mockResolvedValueOnce(createMockResponse({ ok: false, status: 404 }));

    await expect(insights.getInsight("missing")).resolves.toBeNull();
  });

  it("throws for non-404 error responses", async () => {
    const insights = await loadInsightsModule();
    fetchMock().mockResolvedValueOnce(createMockResponse({ ok: false, status: 500 }));

    await expect(insights.getInsight("broken")).rejects.toThrow("Failed to load insight");
  });

  it("returns insight and uses ADMIN_TOKEN fallback for read auth", async () => {
    const insights = await loadInsightsModule({ ADMIN_TOKEN: "admin-only" });
    const payload = makeInsight("my-slug", "2024-01-01");

    fetchMock().mockResolvedValueOnce(
      createMockResponse({ ok: true, status: 200, jsonData: payload })
    );

    await expect(insights.getInsight("my slug/1")).resolves.toEqual(payload);

    const [url, init] = fetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/insights/my%20slug%2F1");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer admin-only"
    );
  });
});

describe("createInsight", () => {
  it("creates insight with write token and returns created entity", async () => {
    const insights = await loadInsightsModule({
      PUBLIC_API_KEY: "pub-token",
      ADMIN_TOKEN: "admin-token",
    });
    const payload = makeInsight("new", "2024-04-10");

    fetchMock().mockResolvedValueOnce(
      createMockResponse({ ok: true, status: 201, jsonData: payload })
    );

    await expect(insights.createInsight(payload)).resolves.toEqual(payload);

    const [url, init] = fetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/insights");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer admin-token"
    );
  });

  it("throws backend text when create fails", async () => {
    const insights = await loadInsightsModule({ ADMIN_TOKEN: "admin-token" });
    fetchMock().mockResolvedValueOnce(
      createMockResponse({ ok: false, status: 422, textData: "validation failed" })
    );

    await expect(insights.createInsight(makeInsight("bad", "2024-01-01"))).rejects.toThrow(
      "validation failed"
    );
  });
});

describe("updateInsight", () => {
  it("updates insight and returns updated entity", async () => {
    const insights = await loadInsightsModule({ ADMIN_TOKEN: "admin-token" });
    const updated = makeInsight("updated", "2024-06-01");

    fetchMock().mockResolvedValueOnce(
      createMockResponse({ ok: true, status: 200, jsonData: updated })
    );

    await expect(insights.updateInsight("my slug", { title: "Updated" })).resolves.toEqual(
      updated
    );

    const [url, init] = fetchMock().mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.test/insights/my%20slug");
    expect(init.method).toBe("PATCH");
  });

  it("throws backend text when update fails", async () => {
    const insights = await loadInsightsModule({ ADMIN_TOKEN: "admin-token" });
    fetchMock().mockResolvedValueOnce(
      createMockResponse({ ok: false, status: 500, textData: "update failed" })
    );

    await expect(insights.updateInsight("slug", { title: "x" })).rejects.toThrow(
      "update failed"
    );
  });
});

describe("deleteInsight", () => {
  it("returns true when delete succeeds", async () => {
    const insights = await loadInsightsModule({ ADMIN_TOKEN: "admin-token" });
    fetchMock().mockResolvedValueOnce(createMockResponse({ ok: true, status: 204 }));

    await expect(insights.deleteInsight("to-delete")).resolves.toBe(true);
  });

  it("throws backend text when delete fails", async () => {
    const insights = await loadInsightsModule({ ADMIN_TOKEN: "admin-token" });
    fetchMock().mockResolvedValueOnce(
      createMockResponse({ ok: false, status: 500, textData: "delete failed" })
    );

    await expect(insights.deleteInsight("broken")).rejects.toThrow("delete failed");
  });
});
