import { fireEvent, render, screen } from "@testing-library/react";
import PropertyFilters from "./PropertyFilters";

describe("PropertyFilters", () => {
  test("renders all six filter inputs", () => {
    render(<PropertyFilters onSearch={jest.fn()} />);

    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.getByLabelText("ZIP Code")).toBeInTheDocument();
    expect(screen.getByLabelText("Min Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Max Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Beds")).toBeInTheDocument();
    expect(screen.getByLabelText("Baths")).toBeInTheDocument();
  });

  test("calls onSearch with entered filters", () => {
    const onSearch = jest.fn();

    render(<PropertyFilters onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Portland" },
    });

    fireEvent.change(screen.getByLabelText("Beds"), {
      target: { value: "3" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(onSearch).toHaveBeenCalledWith({
      city: "Portland",
      beds: "3",
    });
  });

  test("clear resets the form and searches without filters", () => {
    const onSearch = jest.fn();

    render(<PropertyFilters onSearch={onSearch} />);

    const cityInput = screen.getByLabelText("City");

    fireEvent.change(cityInput, {
      target: { value: "Portland" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Clear Filters" })
    );

    expect(cityInput).toHaveValue("");
    expect(onSearch).toHaveBeenCalledWith({});
  });
});