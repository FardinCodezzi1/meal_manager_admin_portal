"use client";

import { FadeIn } from "@/components/common/Motion";
import { fadeUpSpring } from "@/lib/motion.variants";
import { cn } from "@/lib/cn.util";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const headerActions = actions || children;
  return (
    <FadeIn
      variants={fadeUpSpring}
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {headerActions ? <div className="flex shrink-0 items-center gap-2">{headerActions}</div> : null}
    </FadeIn>
  );
}
