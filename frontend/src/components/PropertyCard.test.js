import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PropertyCard from "./PropertyCard";

const property = {
  L_ListingID: "abc123",
  L_Address: "123 Main St",
  L_City: "Portland",
  L_State: "OR",
  L_Zip: "97201",
  L_SystemPrice: 450000,
  L_Keyword2: 3,
  LM_Dec_3: 2,
  LM_Int2_3: 1800,
  L_Photos: JSON.stringify(["photo1.jpg"]),
};

function renderCard() {
  return render(
    <MemoryRouter>
      <PropertyCard property={property} />
    </MemoryRouter>
  );
}

describe("PropertyCard", () => {
  test("renders property data", () => {
    renderCard();

    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("Portland, OR, 97201")).toBeInTheDocument();
    expect(screen.getByText("$450,000")).toBeInTheDocument();
  });

  test("links to the property detail page", () => {
    renderCard();

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/property/abc123"
    );
  });
});
