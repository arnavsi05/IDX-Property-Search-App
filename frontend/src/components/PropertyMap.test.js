import { render, screen } from "@testing-library/react";
import PropertyMap from "./PropertyMap";

describe("PropertyMap", () => {
  test("renders nothing when latitude and longitude are missing", () => {
    const { container } = render(<PropertyMap latitude={null} longitude={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  test("renders nothing when latitude and longitude are both zero", () => {
    const { container } = render(<PropertyMap latitude={0} longitude={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  test("renders a directions link when coordinates are present", () => {
    render(
      <PropertyMap latitude={45.5} longitude={-122.6} address="123 Main St" />
    );

    const link = screen.getByRole("link", { name: "Get Directions" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.google.com/maps/dir/?api=1&destination=45.5,-122.6"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });
});
