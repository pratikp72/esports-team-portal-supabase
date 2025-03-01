import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EnvVarWarning } from "@/components/env-var-warning";
import { BrowserRouter } from "react-router-dom";

describe("EnvVarWarning Component", () => {
  it("renders the badge with the correct text", () => {
    render(<EnvVarWarning />);
    
    // Check if the badge with the required text is present
    expect(
      screen.getByText("Supabase environment variables required")
    ).toBeInTheDocument();
  });

  it("renders disabled buttons with correct links", () => {
    render(<EnvVarWarning />);
    
    const signInButton = screen.getByRole("link", { name: /sign in/i });
    const signUpButton = screen.getByRole("link", { name: /sign up/i });

    // Ensure buttons are present and disabled
    expect(signInButton).toBeInTheDocument();
    expect(signUpButton).toBeInTheDocument();

    // Verify the links
    expect(signInButton).toHaveAttribute("href", "/sign-in");
    expect(signUpButton).toHaveAttribute("href", "/sign-up");
  });

  it("ensures buttons are visually disabled", () => {
    render(<EnvVarWarning />);
    
    const buttons = screen.getAllByRole("link");

    buttons.forEach((button) => {
      expect(button).toHaveClass("opacity-75 cursor-none pointer-events-none");
    });
  });
});
