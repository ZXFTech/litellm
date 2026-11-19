"use client";

import { useId, type ReactNode } from "react";
import { Controller, type ControllerProps, type ControllerRenderProps, type FieldPath, type FieldValues } from "react-hook-form";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

export type FormFieldControlProps<Values extends FieldValues, Name extends FieldPath<Values>> = ControllerRenderProps<Values, Name> & {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
  "aria-labelledby": string | undefined;
};

export type FormFieldProps<Values extends FieldValues, Name extends FieldPath<Values>, TransformedValues = Values> = Omit<ControllerProps<Values, Name, TransformedValues>, "render"> & {
  label?: ReactNode;
  description?: ReactNode;
  orientation?: "vertical" | "horizontal" | "responsive";
  className?: string;
  children: (control: FormFieldControlProps<Values, Name>) => ReactNode;
};

export function FormField<Values extends FieldValues, Name extends FieldPath<Values>, TransformedValues = Values>({ label, description, orientation, className, children, ...controller }: FormFieldProps<Values, Name, TransformedValues>) {
  const id = useId();
  const controlId = `${id}-control`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const labelId = `${id}-label`;
  return <Controller {...controller} render={({ field, fieldState }) => {
    const invalid = Boolean(fieldState.error);
    const hasDescription = description != null && description !== false;
    const hasError = Boolean(fieldState.error?.message);
    const describedBy = [hasDescription ? descriptionId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined;
    const labelNode = label != null ? <FieldLabel id={labelId} htmlFor={controlId}>{label}</FieldLabel> : null;
    const descriptionNode = hasDescription ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null;
    const errorNode = <FieldError id={errorId} errors={[fieldState.error]} />;
    const controlNode = children({ ...field, id: controlId, "aria-invalid": invalid || undefined, "aria-describedby": describedBy, "aria-labelledby": label != null ? labelId : undefined });
    return <Field orientation={orientation} invalid={invalid} disabled={field.disabled} className={className}>
      {orientation === "horizontal" || orientation === "responsive" ? <>
        <FieldContent>{labelNode}{descriptionNode}{errorNode}</FieldContent>
        {controlNode}
      </> : <>{labelNode}{controlNode}{descriptionNode}{errorNode}</>}
    </Field>;
  }} />;
}
