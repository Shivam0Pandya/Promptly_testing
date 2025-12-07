import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthView from "../../pages/AuthView";
import axios from "axios";

jest.mock("axios");

describe("Integration - Auth Login Flow", () => {

  test("logs in successfully & stores token", async () => {

    const mockLogin = jest.fn();
    axios.post.mockResolvedValue({ 
      data: { token: "mockToken", user: { name: "Test User" } }
    });

    render(<AuthView onAuthSuccess={mockLogin} />);

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "test@mail.com" }
    });

    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "password123" }
    });

    fireEvent.click(screen.getByText(/Log In/i));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();   //  FIX 1 ✔
      expect(localStorage.getItem("token")).toBe("mockToken"); // FIX 2 ✔
    });
  });
});
