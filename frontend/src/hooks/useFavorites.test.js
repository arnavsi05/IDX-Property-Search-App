import { act, renderHook } from "@testing-library/react";
import { useFavorites } from "./useFavorites";

describe("useFavorites", () => {
  test("toggles a favorite on and off", () => {
    const { result } = renderHook(() => useFavorites());
    const id = "toggle-test-id";

    expect(result.current.isFavorite(id)).toBe(false);

    act(() => {
      result.current.toggleFavorite(id);
    });

    expect(result.current.isFavorite(id)).toBe(true);

    act(() => {
      result.current.toggleFavorite(id);
    });

    expect(result.current.isFavorite(id)).toBe(false);
  });

  test("persists favorites to localStorage", () => {
    const { result } = renderHook(() => useFavorites());
    const id = "persist-test-id";

    act(() => {
      result.current.toggleFavorite(id);
    });

    const stored = JSON.parse(window.localStorage.getItem("idx-favorites"));
    expect(stored).toContain(id);

    act(() => {
      result.current.toggleFavorite(id);
    });
  });

  test("keeps separate hook instances in sync", () => {
    const hookA = renderHook(() => useFavorites());
    const hookB = renderHook(() => useFavorites());
    const id = "sync-test-id";

    act(() => {
      hookA.result.current.toggleFavorite(id);
    });

    expect(hookB.result.current.isFavorite(id)).toBe(true);
    expect(hookB.result.current.favoriteIds).toContain(id);

    act(() => {
      hookA.result.current.toggleFavorite(id);
    });

    expect(hookB.result.current.isFavorite(id)).toBe(false);
  });
});
