import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReliabilityBadge } from "./reliability-badge";

describe("ReliabilityBadge", () => {
  it("shows the number and the band label together", () => {
    render(<ReliabilityBadge value={0.94215} />);
    expect(screen.getByText("0.9421")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("wears the band as a data attribute so styling never drifts", () => {
    const { container, rerender } = render(<ReliabilityBadge value={0.3} />);
    expect(container.firstChild).toHaveAttribute("data-band", "low");
    rerender(<ReliabilityBadge value={null} />);
    expect(container.firstChild).toHaveAttribute("data-band", "none");
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("keeps the full eight decimals within reach as a title", () => {
    const { container } = render(<ReliabilityBadge value={0.123456789} />);
    expect(container.firstChild).toHaveAttribute("title", "0.12345678 · Low");
  });
});
