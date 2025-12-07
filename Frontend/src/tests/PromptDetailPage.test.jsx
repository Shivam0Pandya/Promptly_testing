// src/tests/PromptDetailPage.test.jsx
import { render, screen } from "@testing-library/react";
import PromptDetailPage from "../pages/PromptDetailPage";

const mockPrompt = {
  _id: "1",
  title: "AI Prompt",
  createdBy: { name: "John" },
  body: "Generate AI text"
};



describe("PromptDetailPage Component", () => {
  test("renders prompt title & body", () => {
    render(<PromptDetailPage prompt={mockPrompt} goBackToLibrary={()=>{}} />);
    expect(screen.getByText("AI Prompt")).toBeInTheDocument();
    expect(screen.getByText("Generate AI text")).toBeInTheDocument();
  });

  test("shows creator name", () => {
    render(<PromptDetailPage prompt={mockPrompt} goBackToLibrary={()=>{}} />);
    expect(screen.getByText(/John/)).toBeInTheDocument();
  });
});
