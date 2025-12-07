import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../components/Layout/Header";

describe("Header Component", () => {

  test("renders search input", () => {
    render(<Header searchQuery="" setSearchQuery={() => {}} />);
    expect(screen.getByPlaceholderText(/Search Active Workspace/i)).toBeInTheDocument();
  });

  test("updates search value", () => {
    const setSearch = jest.fn();
    render(<Header searchQuery="" setSearchQuery={setSearch} />);

    fireEvent.change(screen.getByPlaceholderText(/Search Active Workspace/i), {
      target: { value: "AI" }
    });

    expect(setSearch).toHaveBeenCalledWith("AI");
  });

});
