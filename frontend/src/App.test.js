import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the property search application", () => {
  render(<App />);

  const heading = screen.getByRole("heading", {
    name: /property search/i,
  });

  expect(heading).toBeInTheDocument();
});