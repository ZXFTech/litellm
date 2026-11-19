import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./input";
import { NumberInput } from "./input-group";

describe("numeric input integration", () => {
  it("preserves the invalid value for validation in an existing native Input", () => {
    const onChange = vi.fn();
    render(<Input aria-label="Budget" type="number" min={2} max={10} onChange={onChange} />);

    const input = screen.getByRole("spinbutton", { name: "Budget" });
    fireEvent.change(input, { target: { value: "17" } });
    fireEvent.blur(input);

    expect(input).toHaveValue(17);
    expect(input).toBeInvalid();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("reports a corrected value through the controlled NumberInput change handler on Enter", () => {
    function ControlledNumberInput() {
      const [value, setValue] = useState("4");
      return (
        <NumberInput
          aria-label="Shares"
          min={2}
          max={10}
          prefix="¥"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
      );
    }

    render(<ControlledNumberInput />);

    const input = screen.getByRole("spinbutton", { name: "Shares" });
    fireEvent.change(input, { target: { value: "17" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue(10);
    expect(input).toBeValid();
    expect(screen.getByRole("status")).toHaveTextContent("Enter a value from 2 to 10");
  });
});
