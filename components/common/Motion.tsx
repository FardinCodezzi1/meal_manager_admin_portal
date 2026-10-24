"use client";

import {
  motion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { fadeUpSpring, staggerContainer } from "@/lib/motion.variants";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
} & Omit<
  HTMLMotionProps<"div">,
  "children" | "variants" | "initial" | "animate"
>;

export function FadeIn({
  children,
  className,
  variants = fadeUpSpring,
  delay,
  ...rest
}: FadeInProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={delay != null ? { delay } : undefined}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
} & Omit<
  HTMLMotionProps<"div">,
  "children" | "variants" | "initial" | "animate"
>;

export function Stagger({
  children,
  className,
  variants = staggerContainer,
  ...rest
}: StaggerProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
} & Omit<HTMLMotionProps<"div">, "children" | "variants">;

export function StaggerItem({
  children,
  className,
  variants = fadeUpSpring,
  ...rest
}: StaggerItemProps) {
  return (
    <motion.div variants={variants} className={className} {...rest}>
      {children}
    </motion.div>
  );
}
