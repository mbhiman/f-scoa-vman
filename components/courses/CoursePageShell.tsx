"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animation/animations";

export default function CoursePageShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="mx-auto min-h-[60vh] w-full max-w-4xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8"
    >
      <motion.header variants={slideUp} className="relative mb-6 sm:mb-8">
        <div className="pointer-events-none absolute -left-6 -top-10 h-40 w-40 rounded-full bg-primary/[0.07] blur-3xl dark:bg-primary/10" aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Course</p>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">{subtitle}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex w-full shrink-0 flex-wrap items-stretch gap-2 sm:w-auto sm:justify-end sm:gap-3">
              {actions}
            </div>
          ) : null}
        </div>
      </motion.header>

      <motion.div
        variants={slideUp}
        className="card relative overflow-hidden rounded-2xl border-border/90 p-5 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.25)] ring-1 ring-black/3 dark:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.65)] dark:ring-white/6 sm:p-7 lg:p-8"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"
          aria-hidden
        />
        <div className="relative">{children}</div>
      </motion.div>
    </motion.div>
  );
}
