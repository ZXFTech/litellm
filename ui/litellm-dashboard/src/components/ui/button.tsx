import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cva.config";
import { buttonVariants as foraiButtonVariants } from "@/lib/forai-recipes/button-variants";

const dashboardSizes: Partial<Record<NonNullable<ButtonVariantProps["size"]>, string>> = {
  default: "h-9",
  sm: "h-8",
  lg: "h-10",
  icon: "size-9",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
};

type ButtonVariantProps = VariantProps<typeof foraiButtonVariants>;
type ButtonProps = ButtonPrimitive.Props & ButtonVariantProps;

function buttonVariants({ size, class: classes, className, ...props }: Parameters<typeof foraiButtonVariants>[0] = {}) {
  const dashboardSize = size === null ? undefined : dashboardSizes[size ?? "default"];
  return cn(foraiButtonVariants({ ...props, size }), dashboardSize, classes, className);
}

function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  const mergedClassName = (state: ButtonPrimitive.State) =>
    buttonVariants({
      variant,
      size,
      className: typeof className === "function" ? className(state) : className,
    });

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={mergedClassName}
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonProps };
