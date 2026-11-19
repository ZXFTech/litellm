"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type RecordModeValue = "hold" | "click";

export function RecordMode({ value, onValueChange, disabled = false }: { value: RecordModeValue; onValueChange: (value: RecordModeValue) => void; disabled?: boolean }) {
  return (
    <ToggleGroup aria-label="录音操作方式" value={[value]} disabled={disabled} onValueChange={(values) => {
      if (values[0] === "hold" || values[0] === "click") onValueChange(values[0]);
    }}>
      <ToggleGroupItem value="hold">长按记录</ToggleGroupItem>
      <ToggleGroupItem value="click">点击记录</ToggleGroupItem>
    </ToggleGroup>
  );
}
