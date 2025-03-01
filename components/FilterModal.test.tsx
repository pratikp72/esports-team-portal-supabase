import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FilterModal from "./FilterModal";

describe("FilterModal Component", () => {
  const onClose = vi.fn();
  const onApply = vi.fn();

  const setup = (open = true) => {
    return render(<FilterModal open={open} onClose={onClose} onApply={onApply} />);
  };

  it("renders the modal when open is true", () => {
    setup();

    expect(screen.getByText("Filter Teams")).toBeInTheDocument();
    expect(screen.getByText("Skill Level")).toBeInTheDocument();
    expect(screen.getByText("Region")).toBeInTheDocument();
    expect(screen.getByText("Only show available teams")).toBeInTheDocument();
  });

  it("does not render the modal when open is false", () => {
    setup(false);

    expect(screen.queryByText("Filter Teams")).not.toBeInTheDocument();
  });

  it("calls onClose when the Close button is clicked", () => {
    setup();

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onApply with selected filters when Apply button is clicked", () => {
    setup();

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith({
      game_type: "",
      skill_level: "",
      region: "",
      is_available: false,
    });
  });


  it("allows toggling the availability checkbox", () => {
    setup();

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
