import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ListingsPage from "./ListingsPage";
import { fetchProperties } from "../api/client";

jest.mock("../api/client");

function renderPage() {
  return render(
    <MemoryRouter>
      <ListingsPage />
    </MemoryRouter>
  );
}

const sampleProperty = {
  L_ListingID: "123",
  L_Address: "123 Main St",
  L_City: "Portland",
  L_State: "OR",
  L_Zip: "97201",
  L_SystemPrice: 450000,
  L_Photos: "[]",
};

function mockResults({ total = 1, results = [sampleProperty] } = {}) {
  fetchProperties.mockResolvedValueOnce({ total, limit: 20, offset: 0, results });
}

describe("ListingsPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows a loading state, then the results summary", async () => {
    mockResults({ total: 53122 });

    renderPage();

    expect(screen.getByText("Loading properties...")).toBeInTheDocument();

    expect(
      await screen.findByText("Showing 1-20 of 53122 properties")
    ).toBeInTheDocument();
  });

  test("shows a helpful message and an error when the API call fails", async () => {
    fetchProperties.mockRejectedValueOnce(new Error("Database unavailable"));

    renderPage();

    expect(
      await screen.findByText("Error: Database unavailable")
    ).toBeInTheDocument();
  });

  test("shows a no-results message when nothing matches", async () => {
    mockResults({ total: 0, results: [] });

    renderPage();

    expect(
      await screen.findByText("No properties found. Try changing your filters.")
    ).toBeInTheDocument();
  });

  test("applying a filter fetches page 1 with no sort applied", async () => {
    mockResults({ total: 100 });
    renderPage();
    await screen.findByText("Showing 1-20 of 100 properties");

    mockResults({ total: 3 });
    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Portland" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(fetchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({ city: "Portland", limit: 20, offset: 0 })
      );
    });

    const lastCallArgs = fetchProperties.mock.calls.at(-1)[0];
    expect(lastCallArgs.sortBy).toBeUndefined();
  });

  test("choosing a sort option resets to page 1 and passes sortBy/sortOrder", async () => {
    mockResults({ total: 100 });
    renderPage();
    await screen.findByText("Showing 1-20 of 100 properties");

    mockResults({ total: 100 });
    fireEvent.change(screen.getByLabelText("Sort By"), {
      target: { value: "L_SystemPrice:DESC" },
    });

    await waitFor(() => {
      expect(fetchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sortBy: "L_SystemPrice",
          sortOrder: "DESC",
          offset: 0,
        })
      );
    });
  });

  test("changing pages requests the correct offset and keeps the active sort", async () => {
    mockResults({ total: 100 });
    renderPage();
    await screen.findByText("Showing 1-20 of 100 properties");

    mockResults({ total: 100 });
    fireEvent.change(screen.getByLabelText("Sort By"), {
      target: { value: "L_SystemPrice:ASC" },
    });
    await waitFor(() =>
      expect(screen.queryByText("Loading properties...")).not.toBeInTheDocument()
    );

    mockResults({ total: 100 });
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(fetchProperties).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sortBy: "L_SystemPrice",
          sortOrder: "ASC",
          offset: 20,
        })
      );
    });
  });
});
