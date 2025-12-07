import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../components/Layout/Sidebar";

test("renders navigation items", () => {
  render(<Sidebar workspaces={[]} setCurrentPage={()=>{}} setSelectedWorkspaceId={()=>{}} />);
  
  expect(screen.getByText("Home")).toBeInTheDocument();
  expect(screen.getByText("My Workspace")).toBeInTheDocument();
  expect(screen.getByText("Requests")).toBeInTheDocument();
  expect(screen.getByText("Explore")).toBeInTheDocument();
});
