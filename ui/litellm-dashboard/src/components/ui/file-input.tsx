"use client";

import { useRef, useState, type ChangeEvent, type ComponentProps } from "react";
import { FileIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/cva.config";

type FileInputProps = Omit<ComponentProps<"input">, "type" | "value" | "defaultValue" | "ref" | "children"> & {
  onFilesChange?: (files: File[]) => void;
};

function FileInput({ className, disabled, onChange, onFilesChange, ...props }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileName = fileNames.join("、");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    setFileNames(files.map((file) => file.name));
    onFilesChange?.(files);
    onChange?.(event);
  }

  function clear() {
    const input = inputRef.current;
    if (!input || disabled) return;
    input.value = "";
    // Notify the native control, Base UI Field and consumers of the cleared value.
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.focus();
  }

  return (
    <InputGroup data-file-input="" className={className}>
      <InputGroupAddon className={disabled ? "cursor-default" : undefined} onClick={(event) => {
        event.preventDefault();
        inputRef.current?.click();
      }}>
        <FileIcon aria-hidden="true" />
      </InputGroupAddon>
      <div className="relative flex h-full min-w-0 flex-1 items-center px-1.5">
        <InputGroupInput
          {...props}
          ref={inputRef}
          type="file"
          title={fileName || props.title}
          disabled={disabled}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full opacity-0 disabled:opacity-0"
        />
        <span
          data-slot="file-input-text"
          aria-hidden="true"
          title={fileName || undefined}
          className={cn("pointer-events-none min-w-0 truncate text-base md:text-sm", !fileName && "text-muted-foreground")}
        >
          {fileName || "选择文件"}
        </span>
      </div>
      {fileNames.length > 0 ? (
        <InputGroupAddon align="inline-end">
          <Button type="button" variant="ghost" size="icon-xs" aria-label="清空文件" disabled={disabled} onClick={clear}>
            <XIcon aria-hidden="true" />
          </Button>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

export { FileInput, type FileInputProps };
