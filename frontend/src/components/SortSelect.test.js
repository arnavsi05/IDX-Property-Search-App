import { fireEvent, render, screen } from "@testing-library/react";
import SortSelect, { SORT_OPTIONS } from "./SortSelect";

describe("SortSelect", () => {
  test("renders every sort option", () => {
    render(<SortSelect value="" onChange={jest.fn()} />);

    SORT_OPTIONS.forEach((option) => {
      expect(
        screen.getByRole("option", { name: option.label })
      ).toBeInTheDocument();
    });
  });

  test("calls onChange with the selected value", () => {
    const onChange = jest.fn();

    render(<SortSelect value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Sort By"), {
      target: { value: "L_SystemPrice:ASC" },
    });

    expect(onChange).toHaveBeenCalledWith("L_SystemPrice:ASC");
  });
});
