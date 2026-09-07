import { fireEvent, render, screen, within } from "@testing-library/react";
import PropertyImageGallery from "./PropertyImageGallery";

const twoPhotos = JSON.stringify(["photo1.jpg", "photo2.jpg"]);

describe("PropertyImageGallery", () => {
  test("shows a placeholder when there are no photos", () => {
    render(<PropertyImageGallery photoData={null} address="123 Main St" />);

    expect(screen.getByText("No photos available")).toBeInTheDocument();
  });

  test("thumbnail click updates the main image", () => {
    render(<PropertyImageGallery photoData={twoPhotos} address="123 Main St" />);

    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    const thumbnails = screen.getAllByRole("button", { name: /Property \d/ });
    fireEvent.click(thumbnails[1]);

    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  test("main gallery arrows cycle through photos", () => {
    render(<PropertyImageGallery photoData={twoPhotos} address="123 Main St" />);

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  test("clicking the main image opens a lightbox, Escape closes it", () => {
    render(<PropertyImageGallery photoData={twoPhotos} address="123 Main St" />);

    fireEvent.click(screen.getByAltText("123 Main St"));
    expect(screen.getByRole("dialog", { name: "Photo lightbox" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Photo lightbox" })).not.toBeInTheDocument();
  });

  test("the close button closes the lightbox", () => {
    render(<PropertyImageGallery photoData={twoPhotos} address="123 Main St" />);

    fireEvent.click(screen.getByAltText("123 Main St"));
    fireEvent.click(screen.getByRole("button", { name: "Close lightbox" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("clicking outside the image closes the lightbox", () => {
    render(<PropertyImageGallery photoData={twoPhotos} address="123 Main St" />);

    fireEvent.click(screen.getByAltText("123 Main St"));
    fireEvent.click(screen.getByRole("dialog", { name: "Photo lightbox" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("left/right arrows in the lightbox navigate photos", () => {
    render(<PropertyImageGallery photoData={twoPhotos} address="123 Main St" />);

    fireEvent.click(screen.getByAltText("123 Main St"));
    const dialog = screen.getByRole("dialog", { name: "Photo lightbox" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Next photo" }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Previous photo" }));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  test("Escape and arrow keys do nothing while the lightbox is closed", () => {
    render(<PropertyImageGallery photoData={twoPhotos} address="123 Main St" />);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
