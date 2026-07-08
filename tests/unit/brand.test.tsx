import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Brand } from "@/components/Brand";

describe("<Brand />", () => {
  it("exibe o nome da biblioteca", () => {
    render(<Brand />);
    expect(screen.getByText("Biblioteca IECG")).toBeInTheDocument();
  });
});
