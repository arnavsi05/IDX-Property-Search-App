import { fetchProperties, fetchPropertyDetail, fetchOpenHouses } from "./client";

describe("fetchProperties", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns property data when the request succeeds", async () => {
    const mockData = {
      total: 1,
      limit: 20,
      offset: 0,
      results: [
        {
          L_ListingID: "123",
          L_Address: "123 Main St",
        },
      ],
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchProperties();

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith("/api/properties");
  });

  test("includes non-empty filters in the request", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 0,
        limit: 20,
        offset: 0,
        results: [],
      }),
    });

    await fetchProperties({
      city: "Portland",
      minPrice: 300000,
      beds: 3,
      zipcode: "",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/properties?city=Portland&minPrice=300000&beds=3"
    );
  });

  test("throws a meaningful error when the API fails", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Database unavailable",
      }),
    });

    await expect(fetchProperties()).rejects.toThrow("Database unavailable");
  });
});

describe("fetchPropertyDetail", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns property data when the request succeeds", async () => {
    const mockProperty = { L_ListingID: "123", L_Address: "123 Main St" };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockProperty,
    });

    const result = await fetchPropertyDetail("123");

    expect(result).toEqual(mockProperty);
    expect(global.fetch).toHaveBeenCalledWith("/api/properties/123");
  });

  test("throws a meaningful error for an unknown listing", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Property not found" }),
    });

    await expect(fetchPropertyDetail("does-not-exist")).rejects.toThrow(
      "Property not found"
    );
  });
});

describe("fetchOpenHouses", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns the open house list when the request succeeds", async () => {
    const mockOpenHouses = [{ L_ListingID: "123", OpenHouseDate: "2026-01-01" }];

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockOpenHouses,
    });

    const result = await fetchOpenHouses("123");

    expect(result).toEqual(mockOpenHouses);
    expect(global.fetch).toHaveBeenCalledWith("/api/properties/123/openhouses");
  });

  test("throws a meaningful error when the request fails", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Property not found" }),
    });

    await expect(fetchOpenHouses("does-not-exist")).rejects.toThrow(
      "Property not found"
    );
  });
});