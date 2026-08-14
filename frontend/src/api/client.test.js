import { fetchProperties } from "./client";

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