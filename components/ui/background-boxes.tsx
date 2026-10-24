"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn.util";

interface BoxesProps {
  className?: string;
  /** Custom hover highlight colors for the grid boxes */
  colors?: string[];
  /** Grid line and plus icon stroke color class */
  borderColor?: string;
}

const DEFAULT_COLORS = [
  "#3b82f6", // Blue 500
  "#06b6d4", // Cyan 500
  "#6366f1", // Indigo 500
  "#0ea5e9", // Sky 500
  "#14b8a6", // Teal 500
  "#8b5cf6", // Violet 500
  "#60a5fa", // Blue 400
  "#38bdf8", // Sky 400
];

export const BoxesCore = ({
  className,
  colors = DEFAULT_COLORS,
  borderColor = "border-slate-800/40",
  ...rest
}: BoxesProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const rows = new Array(120).fill(1);
  const cols = new Array(80).fill(1);

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn(
        "absolute -top-1/4 left-1/4 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/2 p-4 pointer-events-auto",
        className
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row` + i}
          className={cn("relative h-8 w-16 border-l", borderColor)}
        >
          {cols.map((_, j) => {
            const colorIndex = (i * 31 + j * 17) % colors.length;
            const hoverColor = colors[colorIndex];

            return (
              <motion.div
                whileHover={{
                  backgroundColor: hoverColor,
                  transition: { duration: 0 },
                }}
                animate={{
                  transition: { duration: 2 },
                }}
                key={`col` + j}
                className={cn("relative h-8 w-16 border-t border-r", borderColor)}
              >
                {j % 2 === 0 && i % 2 === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className={cn(
                      "pointer-events-none absolute -top-3.5 -left-5.5 h-6 w-10 stroke-[1px]",
                      borderColor.replace("border-", "text-")
                    )}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                ) : null}
              </motion.div>
            );
          })}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
