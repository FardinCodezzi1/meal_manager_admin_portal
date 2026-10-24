import { cn } from "@/lib/cn.util";

export type TextLoaderProps = {
  text?: string;
  className?: string;
};

export function TextLoader({
  text = "Loading...",
  className,
}: TextLoaderProps) {
  return (
    <div
      role="status"
      aria-label={text}
      className={cn("text-loader", className)}
      style={{ ["--loader-text" as string]: `"${text}"` }}
    />
  );
}
