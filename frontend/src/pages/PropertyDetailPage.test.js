import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PropertyDetailPage from "./PropertyDetailPage";

function renderAtPath(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/property/:id" element={<PropertyDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PropertyDetailPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders property details and open houses on success", async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes("openhouses")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              L_ListingID: "abc123",
              OpenHouseDate: "2026-01-01",
              OH_StartTime: "10:00 AM",
              OH_EndTime: "12:00 PM",
              all_data: JSON.stringify({ OpenHouseRemarks: "Bring an offer!" }),
            },
          ],
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          L_ListingID: "abc123",
          L_Address: "123 Main St",
          L_City: "Portland",
          L_State: "OR",
          L_Zip: "97201",
          L_SystemPrice: 450000,
          L_Photos: JSON.stringify([]),
        }),
      });
    });

    renderAtPath("/property/abc123");

    expect(await screen.findByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("Bring an offer!")).toBeInTheDocument();
  });

  test("shows an error instead of crashing for an unknown property", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Property not found" }),
    });

    renderAtPath("/property/does-not-exist");

    await waitFor(() => {
      expect(screen.getByText("Unable to load property")).toBeInTheDocument();
    });

    expect(screen.getByText("Property not found")).toBeInTheDocument();
  });
});
