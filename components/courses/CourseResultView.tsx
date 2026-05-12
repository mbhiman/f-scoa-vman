"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animation/animations";
import CoursePageShell from "./CoursePageShell";
import { useGetExamResult } from "@/hooks/studentCourses";
import { CourseAlert, CourseMotionFade, CourseSkeletonLine, courseUi } from "./course-ui";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-border/80 bg-linear-to-br from-background to-muted/10 p-4 shadow-sm transition-[transform,box-shadow] duration-200 hover:border-border-hover hover:shadow-md sm:p-5"
      role="group"
      aria-label={label}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-base font-semibold tracking-tight text-foreground sm:text-lg">{value}</p>
    </div>
  );
}

const btnPrimary = ["btn btn-primary min-h-11 rounded-xl px-6 shadow-sm transition-[transform] duration-150 active:scale-[0.98]", courseUi.focusRing].join(
  " ",
);

export default function CourseResultView({ courseId }: { courseId: string }) {
  const { attempt, questions, notSubmittedYet, examNotStarted, loading, error } = useGetExamResult(courseId);

  const title = "Result";
  const subtitle = loading
    ? "Loading your result…"
    : error
      ? error
      : notSubmittedYet
        ? "Exam not submitted yet."
        : examNotStarted
          ? "Exam not started."
          : "Your score and question breakdown.";

  return (
    <CoursePageShell
      title={title}
      subtitle={subtitle}
      actions={
        <Link className={btnPrimary} href={`/courses/${courseId}`}>
          Back
        </Link>
      }
    >
      {loading && !error ? (
        <CourseMotionFade>
          <div className="space-y-6" aria-busy aria-label="Loading result">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseSkeletonLine key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
            <CourseSkeletonLine className="h-40 rounded-2xl" />
          </div>
        </CourseMotionFade>
      ) : error ? (
        <CourseAlert variant="error" title="Could not load result">
          {error}
        </CourseAlert>
      ) : notSubmittedYet || examNotStarted ? (
        <div className="space-y-6">
          <CourseAlert variant="info" title={notSubmittedYet ? "Not submitted" : "Exam not started"}>
            {notSubmittedYet ? "Submit your exam to see results here." : "Begin the exam to generate a result."}
          </CourseAlert>
          <Link className={btnPrimary} href={`/courses/${courseId}/exam`}>
            Go to exam
          </Link>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-10">
          <motion.div variants={slideUp} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Score" value={<span className="font-mono tabular-nums">{attempt?.score ?? "—"}</span>} />
            <Stat
              label="Passed"
              value={attempt?.passed ? <span className="badge-success">Yes</span> : <span className="badge-error">No</span>}
            />
            <Stat
              label="Correct"
              value={
                <span className="font-mono tabular-nums">
                  {attempt?.correctAnswers ?? "—"}/{attempt?.totalQuestions ?? "—"}
                </span>
              }
            />
            <Stat label="Attempt no." value={<span className="font-mono tabular-nums">{attempt?.attemptNo ?? "—"}</span>} />
          </motion.div>

          <motion.section variants={slideUp} className="space-y-5">
            <div className="border-b border-border/80 pb-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Breakdown</h2>
              <p className="mt-1 text-sm text-muted">Review each question and how your answers compare to the correct options.</p>
            </div>
            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/5 px-4 py-10 text-center">
                <p className="text-sm text-muted">No question breakdown available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.questionId}
                    className="overflow-hidden rounded-2xl border border-border/90 bg-background/80 shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-border-hover hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 bg-muted/10 px-4 py-4 sm:px-5">
                      <p className="text-[15px] font-semibold leading-snug text-foreground">
                        <span className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                        {q.questionText}
                      </p>
                      <span className={q.isCorrect ? "badge-success" : "badge-error"}>{q.isCorrect ? "Correct" : "Wrong"}</span>
                    </div>
                    <div className="space-y-2 p-4 sm:p-5">
                      {q.options.map((o) => {
                        const isSelected = q.selectedOptionId === o.optionId;
                        const isCorrect = o.isCorrect;
                        const border =
                          isCorrect && isSelected
                            ? "border-emerald-500/35 bg-emerald-500/[0.08] shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]"
                            : isCorrect
                              ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                              : isSelected
                                ? "border-red-500/35 bg-red-500/[0.07] shadow-[inset_0_0_0_1px_rgba(239,68,68,0.12)]"
                                : "border-border/80 bg-muted/5 hover:border-border-hover";
                        return (
                          <div
                            key={o.optionId}
                            className={`rounded-xl border px-4 py-3 text-sm transition-colors duration-150 ${border}`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span className="leading-snug text-foreground">{o.optionText}</span>
                              <div className="flex flex-wrap gap-2">
                                {isSelected ? <span className="badge-admin-accent">Selected</span> : null}
                                {isCorrect ? <span className="badge-success">Correct answer</span> : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        </motion.div>
      )}
    </CoursePageShell>
  );
}
