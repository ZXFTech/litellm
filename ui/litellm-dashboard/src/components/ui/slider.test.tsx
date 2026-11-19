import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Slider } from "./slider";

describe("Slider", () => {
  it("updates the labeled range input and readout when a tick is selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Slider
        defaultValue={20}
        min={0}
        max={100}
        step={20}
        label="Budget"
        aria-label="Budget amount"
        thumbAlignment="center"
        showTicks
        formatDisplayValue={(value) => "$" + value}
        renderValue={([value]) => <output aria-label="Current budget">{value} dollars</output>}
        onValueChange={onValueChange}
      />,
    );

    const slider = screen.getByRole("slider", { name: "Budget amount" });
    const tick = screen.getByRole("button", { name: "$60" });
    expect(slider).toHaveValue("20");
    expect(tick).toHaveAttribute("aria-pressed", "false");

    await user.click(tick);

    expect(slider).toHaveValue("60");
    expect(tick).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Current budget")).toHaveTextContent("60 dollars");
    expect(onValueChange).toHaveBeenLastCalledWith(60, expect.anything());
  });

  it("keeps array values and moves the named thumb with the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Slider
        defaultValue={[25]}
        step={5}
        aria-label="Minimum confidence"
        thumbAlignment="center"
        onValueChange={onValueChange}
      />,
    );

    const slider = screen.getByRole("slider", { name: "Minimum confidence" });
    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(slider).toHaveFocus();
    expect(slider).toHaveValue("30");
    expect(onValueChange).toHaveBeenLastCalledWith([30], expect.anything());
  });
});
