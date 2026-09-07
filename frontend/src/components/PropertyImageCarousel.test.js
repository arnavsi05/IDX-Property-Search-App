import { fireEvent, render, screen } from "@testing-library/react";
import PropertyImageCarousel from "./PropertyImageCarousel";

const twoPhotos = JSON.stringify(["photo1.jpg", "photo2.jpg"]);

describe("PropertyImageCarousel", () => {
  test("shows a placeholder when there are no photos", () => {
    render(<PropertyImageCarousel photoData={null} address="123 Main St" />);

    expect(screen.getByText("No photo available")).toBeInTheDocument();
  });

  test("hides arrows and counter for a single photo", () => {
    render(
      <PropertyImageCarousel
        photoData={JSON.stringify(["photo1.jpg"])}
        address="123 Main St"
      />
    );

    expect(screen.queryByLabelText("Next photo")).not.toBeInTheDocument();
  });

  test("arrow buttons cycle through photos and update the counter", () => {
    render(<PropertyImageCarousel photoData={twoPhotos} address="123 Main St" />);

    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Next photo"));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Previous photo"));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  test("arrow clicks do not bubble up to a wrapping link", () => {
    const parentClick = jest.fn();

    render(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div onClick={parentClick}>
        <PropertyImageCarousel photoData={twoPhotos} address="123 Main St" />
      </div>
    );

    fireEvent.click(screen.getByLabelText("Next photo"));

    expect(parentClick).not.toHaveBeenCalled();
  });
});
