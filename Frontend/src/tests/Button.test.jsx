import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../components/Common/Button";

describe("Button Component", () => {
  test("renders with text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  test("triggers onClick event", () => {
    const fn = jest.fn();
    render(<Button onClick={fn}>Press</Button>);
    fireEvent.click(screen.getByText("Press"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("renders with variant styling", () => {
    const { container } = render(<Button variant="primary">Save</Button>);
    expect(container.firstChild.classList.contains("bg-accent-teal")).toBeTruthy();
  });
});
