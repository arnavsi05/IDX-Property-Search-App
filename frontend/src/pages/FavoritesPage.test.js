import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FavoritesPage from "./FavoritesPage";
import { fetchPropertyDetail } from "../api/client";
import { useFavorites } from "../hooks/useFavorites";

jest.mock("../api/client");
jest.mock("../hooks/useFavorites");

function renderPage() {
  return render(
    <MemoryRouter>
      <FavoritesPage />
    </MemoryRouter>
  );
}

describe("FavoritesPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows an empty state with a link back to listings", () => {
    useFavorites.mockReturnValue({
      favoriteIds: [],
      isFavorite: () => false,
      toggleFavorite: jest.fn(),
    });

    renderPage();

    expect(screen.getByText("0 saved properties")).toBeInTheDocument();
    expect(screen.getByText(/haven't favorited/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse listings" })
    ).toHaveAttribute("href", "/");
  });

  test("fetches and displays each favorited property", async () => {
    useFavorites.mockReturnValue({
      favoriteIds: ["123"],
      isFavorite: () => true,
      toggleFavorite: jest.fn(),
    });

    fetchPropertyDetail.mockResolvedValue({
      L_ListingID: "123",
      L_Address: "123 Main St",
      L_Photos: "[]",
    });

    renderPage();

    expect(await screen.findByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("1 saved property")).toBeInTheDocument();
    expect(fetchPropertyDetail).toHaveBeenCalledWith("123");
  });

  test("skips a favorite that fails to load instead of crashing", async () => {
    useFavorites.mockReturnValue({
      favoriteIds: ["missing"],
      isFavorite: () => true,
      toggleFavorite: jest.fn(),
    });

    fetchPropertyDetail.mockRejectedValue(new Error("Property not found"));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/haven't favorited/)).toBeInTheDocument();
    });
  });
});
