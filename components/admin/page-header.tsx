import * as React from "react";
import type { JSX } from "react";

import { cn } from "@/lib/utils";
import type { SafeHTMLAttributes, WithDataAttributes } from "@/types/dom";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type DataAttributes = {
  [key in `data-${string}`]?: string | number | undefined;
};

// Preserve support for custom data-* attributes while still preventing callers
// from overriding managed id/className values.
type HeadingProps =
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "id" | "className"> &
  DataAttributes;

type PageHeaderBaseProps = WithDataAttributes<Omit<React.HTMLAttributes<HTMLElement>, "title">>;

type PageHeaderProps = PageHeaderBaseProps & {
  title: string;
  description?: string;
  /** Optional right-aligned actions (buttons, links) */
  actions?: React.ReactNode;
  /** h1..h6. Default h1; never render more than one h1 per page. */
  level?: HeadingLevel;
  className?: string;
  headingId?: string;
  headingClassName?: string;
  descriptionClassName?: string;
  containerClassName?: string;
  headingProps?: HeadingProps;
};

type HeadingTagProps = {
  level: HeadingLevel;
  children: React.ReactNode;
  className?: string;
  id?: string;
};

const HeadingTag = ({ level, children, className, id }: HeadingTagProps) => {
  const Tag = (`h${level}`) as keyof React.JSX.IntrinsicElements;
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
};

export function PageHeader({
  title,
  description,
  actions,
  level = 1,
  className,
  headingId,
  headingClassName,
  descriptionClassName,
  containerClassName,
  headingProps,
  ...headerProps
}: PageHeaderProps) {
  const headingLevel = level ?? 1;

  return (
    <header
      className={cn("mb-6", className)}
      role={headingLevel === 1 ? "banner" : undefined}
      {...headerProps}
    >
      <div className={cn("flex items-start justify-between gap-4", containerClassName)}>
        <div>
          <HeadingTag
            id={headingId}
            level={headingLevel}
            className={cn(
              "text-2xl font-semibold tracking-tight",
              headingClassName,
            )}
            {...headingProps}
          >
            {title}
          </HeadingTag>
          {description ? (
            <p className={cn("mt-1 text-sm text-muted-foreground", descriptionClassName)}>
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}