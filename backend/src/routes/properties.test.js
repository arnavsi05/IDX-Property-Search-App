const express = require("express");
const request = require("supertest");

jest.mock("../db/pool", () => ({
  execute: jest.fn(),
}));

const pool = require("../db/pool");
const propertiesRouter = require("./properties");

function buildApp() {
  const app = express();
  app.use("/api/properties", propertiesRouter);
  return app;
}

const app = buildApp();

const sampleProperty = {
  L_ListingID: "123",
  L_Address: "123 Main St",
  L_City: "Portland",
  L_State: "OR",
  L_Zip: "97201",
  L_SystemPrice: 450000,
  L_Keyword2: 3,
  LM_Dec_3: 2,
  LM_Int2_3: 1800,
  L_Photos: "[]",
  LMD_MP_Latitude: 45.5,
  LMD_MP_Longitude: -122.6,
};

// GET /api/properties issues a COUNT query then a SELECT query, in that order.
function mockListQuery({ total, rows }) {
  pool.execute
    .mockResolvedValueOnce([[{ total }]])
    .mockResolvedValueOnce([rows]);
}

describe("GET /api/properties", () => {
  beforeEach(() => {
    pool.execute.mockReset();
  });

  test("returns paginated results with default limit and offset", async () => {
    mockListQuery({ total: 1, rows: [sampleProperty] });

    const res = await request(app).get("/api/properties");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      total: 1,
      limit: 20,
      offset: 0,
      results: [sampleProperty],
    });
  });

  test("applies a custom limit and offset", async () => {
    mockListQuery({ total: 50, rows: [sampleProperty] });

    const res = await request(app).get("/api/properties?limit=10&offset=20");

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(10);
    expect(res.body.offset).toBe(20);

    const dataSql = pool.execute.mock.calls[1][0];
    expect(dataSql).toContain("LIMIT 10");
    expect(dataSql).toContain("OFFSET 20");
  });

  test("filters by city", async () => {
    mockListQuery({ total: 1, rows: [sampleProperty] });

    const res = await request(app).get("/api/properties?city=Portland");

    expect(res.status).toBe(200);
    const [, values] = pool.execute.mock.calls[0];
    expect(values).toContain("Portland");
  });

  test("filters by zipcode", async () => {
    mockListQuery({ total: 1, rows: [sampleProperty] });

    const res = await request(app).get("/api/properties?zipcode=97201");

    expect(res.status).toBe(200);
    const [, values] = pool.execute.mock.calls[0];
    expect(values).toContain("97201");
  });

  test("filters by minPrice and maxPrice", async () => {
    mockListQuery({ total: 1, rows: [sampleProperty] });

    const res = await request(app).get(
      "/api/properties?minPrice=300000&maxPrice=500000"
    );

    expect(res.status).toBe(200);
    const [, values] = pool.execute.mock.calls[0];
    expect(values).toEqual(expect.arrayContaining([300000, 500000]));
  });

  test("filters by beds", async () => {
    mockListQuery({ total: 1, rows: [sampleProperty] });

    const res = await request(app).get("/api/properties?beds=3");

    expect(res.status).toBe(200);
    const [, values] = pool.execute.mock.calls[0];
    expect(values).toContain(3);
  });

  test("filters by baths", async () => {
    mockListQuery({ total: 1, rows: [sampleProperty] });

    const res = await request(app).get("/api/properties?baths=2");

    expect(res.status).toBe(200);
    const [, values] = pool.execute.mock.calls[0];
    expect(values).toContain(2);
  });

  // Week 3 debug challenge regression: combining minPrice with beds must not
  // scramble the parameterized values array relative to the WHERE clause.
  test("combines minPrice and beds filters with correctly ordered values", async () => {
    mockListQuery({ total: 1, rows: [sampleProperty] });

    const res = await request(app).get(
      "/api/properties?minPrice=300000&beds=3"
    );

    expect(res.status).toBe(200);
    const [countSql, values] = pool.execute.mock.calls[0];
    expect(countSql).toContain("L_SystemPrice >= ?");
    expect(countSql).toContain("L_Keyword2 >= ?");
    expect(values).toEqual([300000, 3]);
  });

  test("sorts by a whitelisted column and direction", async () => {
    mockListQuery({ total: 1, rows: [sampleProperty] });

    const res = await request(app).get(
      "/api/properties?sortBy=L_SystemPrice&sortOrder=DESC"
    );

    expect(res.status).toBe(200);
    const dataSql = pool.execute.mock.calls[1][0];
    expect(dataSql).toContain("ORDER BY L_SystemPrice DESC");
  });

  test("rejects an invalid sortBy with 400 and does not query the database", async () => {
    const res = await request(app).get("/api/properties?sortBy=ListPrice");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sortBy/);
    expect(pool.execute).not.toHaveBeenCalled();
  });

  test("rejects an invalid sortOrder with 400", async () => {
    const res = await request(app).get(
      "/api/properties?sortBy=L_SystemPrice&sortOrder=SIDEWAYS"
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sortOrder/);
  });

  test("rejects limit=0 with 400", async () => {
    const res = await request(app).get("/api/properties?limit=0");

    expect(res.status).toBe(400);
    expect(pool.execute).not.toHaveBeenCalled();
  });

  test("rejects limit over 100 with 400", async () => {
    const res = await request(app).get("/api/properties?limit=200");

    expect(res.status).toBe(400);
  });

  test("rejects a non-numeric minPrice with 400", async () => {
    const res = await request(app).get("/api/properties?minPrice=abc");

    expect(res.status).toBe(400);
  });

  test("rejects minPrice greater than maxPrice with 400", async () => {
    const res = await request(app).get(
      "/api/properties?minPrice=500000&maxPrice=100000"
    );

    expect(res.status).toBe(400);
  });

  test("rejects an empty city with 400", async () => {
    const res = await request(app).get("/api/properties?city=");

    expect(res.status).toBe(400);
  });

  test("returns 500 when the database query fails", async () => {
    pool.execute.mockRejectedValueOnce(new Error("connection lost"));

    const res = await request(app).get("/api/properties");

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe("GET /api/properties/:id", () => {
  beforeEach(() => {
    pool.execute.mockReset();
  });

  test("returns the property when found", async () => {
    pool.execute.mockResolvedValueOnce([[sampleProperty]]);

    const res = await request(app).get("/api/properties/123");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sampleProperty);
  });

  test("returns 404 with a helpful message for an unknown id", async () => {
    pool.execute.mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test("returns 400 for an id with invalid characters", async () => {
    const res = await request(app).get(
      `/api/properties/${encodeURIComponent("bad id!")}`
    );

    expect(res.status).toBe(400);
    expect(pool.execute).not.toHaveBeenCalled();
  });

  test("returns 400 for an oversized id", async () => {
    const longId = "a".repeat(51);

    const res = await request(app).get(`/api/properties/${longId}`);

    expect(res.status).toBe(400);
  });

  test("returns 500 when the database query fails", async () => {
    pool.execute.mockRejectedValueOnce(new Error("db down"));

    const res = await request(app).get("/api/properties/123");

    expect(res.status).toBe(500);
  });
});

describe("GET /api/properties/:id/openhouses", () => {
  beforeEach(() => {
    pool.execute.mockReset();
  });

  test("returns open houses for an existing property", async () => {
    pool.execute
      .mockResolvedValueOnce([[{ L_ListingID: "123" }]])
      .mockResolvedValueOnce([
        [{ L_ListingID: "123", OpenHouseDate: "2026-01-01" }],
      ]);

    const res = await request(app).get("/api/properties/123/openhouses");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test("returns an empty array when there are no open houses", async () => {
    pool.execute
      .mockResolvedValueOnce([[{ L_ListingID: "123" }]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/properties/123/openhouses");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns 404 for an unknown property", async () => {
    pool.execute.mockResolvedValueOnce([[]]);

    const res = await request(app).get(
      "/api/properties/does-not-exist/openhouses"
    );

    expect(res.status).toBe(404);
  });

  test("returns 400 for an invalid id and does not query the database", async () => {
    const res = await request(app).get("/api/properties/bad%20id/openhouses");

    expect(res.status).toBe(400);
    expect(pool.execute).not.toHaveBeenCalled();
  });

  test("returns 500 when the database query fails", async () => {
    pool.execute.mockRejectedValueOnce(new Error("db down"));

    const res = await request(app).get("/api/properties/123/openhouses");

    expect(res.status).toBe(500);
  });
});
