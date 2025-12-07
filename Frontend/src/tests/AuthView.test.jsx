import { render, screen, fireEvent } from "@testing-library/react";
import AuthView from "../pages/AuthView";

test("renders login form correctly", () => {
  render(<AuthView onAuthSuccess={() => {}} />);

  expect(screen.getByText("Welcome Back")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
});
