"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animation/animations";
import CoursePageShell from "./CoursePageShell";
import { useGetExam, useStartExam, useSubmitExam } from "@/hooks/studentCourses";
import { CourseAlert, CourseMotionFade, CoursePanelSkeleton, CourseSelectableRow, courseUi } from "./course-ui";

type SelectionMap = Record<string, string | null>;

function buildInitialSelections(questions: { id: string }[]) {
  const init: SelectionMap = {};
  questions.forEach((q) => {
    init[q.id] = null;
  });
  return init;
}

const btnSecondary = [
  "btn min-h-11 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-[transform,background-color,border-color] duration-150 hover:border-border-hover hover:bg-muted/25 enabled:active:scale-[0.98]",
  courseUi.focusRing,
].join(" ");

const btnPrimary = ["btn btn-primary min-h-11 rounded-xl px-6 shadow-sm transition-[transform] duration-150 enabled:active:scale-[0.98]", courseUi.focusRing].join(
  " ",
);

export default function CourseExamView({ courseId }: { courseId: string }) {
  const resolvedCourseId =
    typeof courseId === "string" && courseId.trim() !== "" ? courseId.trim() : null;

  const startExam = useStartExam(resolvedCourseId);
  const exam = useGetExam(resolvedCourseId);
  const submitExam = useSubmitExam(resolvedCourseId);

  const [selections, setSelections] = useState<SelectionMap>({});
  const [clientValidationError, setClientValidationError] = useState<string | null>(null);

  React.useEffect(() => {
    if (exam.questions.length === 0) return;
    setSelections((prev) => ({ ...buildInitialSelections(exam.questions), ...prev }));
  }, [exam.questions]);

  React.useEffect(() => {
    if (exam.questions.length === 0) return;
    const allowedQ = new Set(exam.questions.map((q) => q.id));
    const allowedOptByQ = new Map<string, Set<string>>();
    exam.questions.forEach((q) => {
      allowedOptByQ.set(q.id, new Set(q.options.map((o) => o.id)));
    });

    setSelections((prev) => {
      const next: SelectionMap = {};
      Object.entries(prev ?? {}).forEach(([qid, opt]) => {
        if (!allowedQ.has(qid)) return;
        if (opt === null) {
          next[qid] = null;
          return;
        }
        const allowed = allowedOptByQ.get(qid);
        if (!allowed || !allowed.has(opt)) {
          next[qid] = null;
          return;
        }
        next[qid] = opt;
      });

      exam.questions.forEach((q) => {
        if (!(q.id in next)) next[q.id] = null;
      });

      return next;
    });
  }, [exam.questions]);

  const answersPayload = useMemo(() => {
    const allowedOptByQ = new Map<string, Set<string>>();
    exam.questions.forEach((q) => {
      allowedOptByQ.set(q.id, new Set(q.options.map((o) => o.id)));
    });

    return exam.questions
      .map((q) => {
        const opt = selections[q.id];
        if (typeof opt !== "string" || opt.length === 0) return null;
        const allowed = allowedOptByQ.get(q.id);
        if (!allowed || !allowed.has(opt)) return null;
        return { questionId: q.id, selectedOptionId: opt };
      })
      .filter((x): x is { questionId: string; selectedOptionId: string } => Boolean(x));
  }, [exam.questions, selections]);

  if (!resolvedCourseId) {
    return (
      <CoursePageShell
        title="Exam"
        subtitle="Missing course id."
        actions={
          <Link className={btnPrimary} href="/learner/courses">
            Back to courses
          </Link>
        }
      >
        <CourseAlert variant="neutral" title="Invalid link">
          This page was opened without a valid course id.
        </CourseAlert>
      </CoursePageShell>
    );
  }

  const title = "Exam";
  const errorMessage = exam.error ?? startExam.error ?? submitExam.error;
  const subtitle = exam.loading
    ? "Loading exam…"
    : startExam.loading
      ? "Starting exam…"
      : errorMessage
        ? errorMessage
        : "Start the exam, answer each question, and submit when you are ready.";

  const canSubmit = exam.questions.length > 0 && !submitExam.loading && !startExam.loading && !exam.loading;

  const showExamSkeleton = exam.loading && exam.questions.length === 0;

  return (
    <CoursePageShell
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <button type="button" className={btnPrimary} onClick={startExam.start} disabled={startExam.loading}>
            {startExam.loading ? "Starting…" : "Start / Resume"}
          </button>
          <Link className={btnSecondary} href={`/learner/courses/${resolvedCourseId}`}>
            Back
          </Link>
        </>
      }
    >
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        {clientValidationError ? (
          <motion.div variants={slideUp}>
            <CourseAlert variant="error" title="Cannot submit yet">
              {clientValidationError}
            </CourseAlert>
          </motion.div>
        ) : null}

        {(startExam.cooldownActive || startExam.maxAttemptsReached || startExam.alreadyPassed) && (
          <motion.div variants={slideUp}>
            <CourseAlert variant="warning" title="Exam unavailable">
              <div className="space-y-2">
                {startExam.alreadyPassed ? <p>You have already passed this exam.</p> : null}
                {startExam.maxAttemptsReached ? <p>Maximum attempts reached.</p> : null}
                {startExam.cooldownActive ? (
                  <p>
                    Cooldown active. Try again later.{" "}
                    {startExam.cooldownUntil ? <span className="font-mono">{startExam.cooldownUntil}</span> : null}
                  </p>
                ) : null}
              </div>
            </CourseAlert>
          </motion.div>
        )}

        {exam.attemptExpired || exam.examNotStarted || exam.noActiveAttempt || exam.alreadyCompleted ? (
          <motion.div variants={slideUp}>
            <CourseAlert variant="neutral" title="Status">
              <div className="space-y-2">
                {exam.attemptExpired ? <p>Attempt expired. Start again to create a new attempt.</p> : null}
                {exam.examNotStarted ? <p>Exam not started. Click “Start / Resume”.</p> : null}
                {exam.noActiveAttempt ? <p>No active attempt. Click “Start / Resume”.</p> : null}
                {exam.alreadyCompleted ? (
                  <p>
                    Exam already completed.{" "}
                    <Link className="font-semibold text-primary underline underline-offset-2 hover:text-primary-hover" href={`/learner/courses/${resolvedCourseId}/result`}>
                      View result
                    </Link>
                  </p>
                ) : null}
              </div>
            </CourseAlert>
          </motion.div>
        ) : null}

        {submitExam.result ? (
          <motion.div variants={slideUp}>
            <CourseAlert variant="success" title="Submitted">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Score: <span className="font-mono font-semibold">{submitExam.result.score}</span> —{" "}
                  {submitExam.result.passed ? "Passed" : "Failed"}
                </p>
                <Link className={`${btnPrimary} w-full sm:w-auto`} href={`/learner/courses/${resolvedCourseId}/result`}>
                  View result
                </Link>
              </div>
            </CourseAlert>
          </motion.div>
        ) : null}

        {showExamSkeleton ? (
          <CourseMotionFade>
            <div aria-busy aria-label="Loading exam questions">
              <CoursePanelSkeleton rows={8} />
            </div>
          </CourseMotionFade>
        ) : exam.questions.length === 0 ? (
          <motion.div variants={slideUp}>
            <CourseAlert variant="info" title="No questions yet">
              Start or resume the exam to load questions for this attempt.
            </CourseAlert>
          </motion.div>
        ) : (
          <motion.div variants={slideUp} className="space-y-5">
            {exam.questions.map((q, idx) => (
              <div
                key={q.id}
                className={[
                  "rounded-2xl border border-border/90 bg-background/60 p-4 shadow-sm transition-[box-shadow,border-color] duration-200 sm:p-5",
                  "hover:border-border-hover hover:shadow-md",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3">
                  <p className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                    <span className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    {q.questionText}
                  </p>
                  <span className="badge-muted shrink-0">#{q.sortOrder}</span>
                </div>
                <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label={`Question ${idx + 1}`}>
                  {q.options.map((o) => (
                    <CourseSelectableRow
                      key={o.id}
                      name={q.id}
                      checked={selections[q.id] === o.id}
                      onChange={() => setSelections((prev) => ({ ...prev, [q.id]: o.id }))}
                      label={o.optionText}
                    />
                  ))}
                </div>
              </div>
            ))}

            {submitExam.validationErrors.length > 0 ? (
              <CourseAlert variant="warning" title="Validation errors">
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                  {submitExam.validationErrors.map((v, idx) => (
                    <li key={`${v.field}-${idx}`}>
                      <span className="font-semibold">{v.field}</span>: {v.message}
                    </li>
                  ))}
                </ul>
              </CourseAlert>
            ) : null}

            {submitExam.attemptExpired ? (
              <CourseAlert variant="error" title="Attempt expired">
                Start a new attempt and submit again.
              </CourseAlert>
            ) : null}

            {submitExam.alreadySubmitted ? (
              <CourseAlert variant="neutral" title="Already submitted">
                <p>
                  View your outcome on the results page.{" "}
                  <Link className="font-semibold text-primary underline underline-offset-2" href={`/learner/courses/${resolvedCourseId}/result`}>
                    View result
                  </Link>
                </p>
              </CourseAlert>
            ) : null}

            <div className="flex flex-col gap-4 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                Answered{" "}
                <span className="font-mono text-sm font-semibold text-foreground">
                  {answersPayload.length}/{exam.questions.length}
                </span>
              </p>
              <button
                type="button"
                className={btnPrimary}
                disabled={!canSubmit}
                onClick={() => {
                  setClientValidationError(null);
                  if (exam.questions.length === 0) {
                    setClientValidationError("No questions are loaded yet. Click “Start / Resume” first.");
                    return;
                  }
                  if (answersPayload.length === 0) {
                    setClientValidationError(
                      "You have not selected any answers yet. Choose at least one option before submitting.",
                    );
                    return;
                  }
                  void submitExam.submit(answersPayload);
                }}
                aria-busy={submitExam.loading}
              >
                {submitExam.loading ? "Submitting…" : "Submit exam"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </CoursePageShell>
  );
}
