import { fireEvent, render, screen } from "@testing-library/react";
import Pagination from "./Pagination";

describe("Pagination", () => {
  test("disables Previous on the first page", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Previous" })
    ).toBeDisabled();
  });

  test("disables Next on the last page", () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Next" })
    ).toBeDisabled();
  });

  test("calls onPageChange when a page is clicked", () => {
    const onPageChange = jest.fn();

    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "3" })
    );

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test("renders ellipsis for many pages", () => {
    render(
      <Pagination
        currentPage={12}
        totalPages={24}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getAllByText("...")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "24" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "12" })).toBeInTheDocument();
  });

  test("renders no pagination when there is only one page", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={jest.fn()}
      />
    );

    expect(
      screen.queryByRole("navigation")
    ).not.toBeInTheDocument();
  });
});