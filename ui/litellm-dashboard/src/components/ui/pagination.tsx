import type { ComponentProps, ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { Button, buttonVariants, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/cva.config";

function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return <nav aria-label="分页" data-slot="pagination" className={cn("flex w-full justify-start", className)} {...props} />;
}
function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-wrap items-center gap-0.5", className)} {...props} />;
}
function PaginationItem(props: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({ className, isActive = false, ...props }: ComponentProps<"a"> & { isActive?: boolean }) {
  return <a data-slot="pagination-link" data-active={isActive} aria-current={isActive ? "page" : undefined} className={cn(buttonVariants({ variant: isActive ? "outline" : "ghost", size: "icon" }), className)} {...props} />;
}
function PaginationButton({ isActive = false, ...props }: ButtonProps & { isActive?: boolean }) {
  return <Button data-slot="pagination-button" data-active={isActive} aria-current={isActive ? "page" : undefined} variant={isActive ? "outline" : "ghost"} size="icon" {...props} />;
}
function PaginationPrevious({ iconOnly = false, feedbackIcon, ...props }: ButtonProps & { iconOnly?: boolean; feedbackIcon?: ReactNode }) {
  return <Button data-slot="pagination-previous" variant="ghost" size={iconOnly ? "icon" : "default"} aria-label="上一页" {...props}>{feedbackIcon ?? <ChevronLeftIcon data-icon="inline-start" aria-hidden="true" />}{iconOnly ? null : <span className="hidden sm:block">上一页</span>}</Button>;
}
function PaginationNext({ iconOnly = false, feedbackIcon, ...props }: ButtonProps & { iconOnly?: boolean; feedbackIcon?: ReactNode }) {
  return <Button data-slot="pagination-next" variant="ghost" size={iconOnly ? "icon" : "default"} aria-label="下一页" {...props}>{iconOnly ? null : <span className="hidden sm:block">下一页</span>}{feedbackIcon ?? <ChevronRightIcon data-icon="inline-end" aria-hidden="true" />}</Button>;
}
function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="pagination-ellipsis" aria-hidden="true" className={cn("flex size-8 items-center justify-center [&_svg]:size-4", className)} {...props}><MoreHorizontalIcon /></span>;
}

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationButton, PaginationPrevious, PaginationNext, PaginationEllipsis };
