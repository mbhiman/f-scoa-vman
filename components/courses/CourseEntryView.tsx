"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animation/animations";
import CoursePageShell from "./CoursePageShell";
import { useGetCourseEntry } from "@/hooks/studentCourses";
import { CourseAlert, CourseMotionFade, CoursePanelSkeleton, courseUi } from "./course-ui";

/** Parses API datetime strings and shows locale-friendly absolute + relative text */
function CooldownUntilValue({ iso }: { iso: string }) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return <span className="font-mono text-[13px] font-normal">{iso}</span>;
  }

  const absolute = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);

  const diffSec = (d.getTime() - Date.now()) / 1000;
  let relative: string;
  if (Math.abs(diffSec) < 45) {
    relative = diffSec >= 0 ? "Starting momentarily" : "Just passed";
  } else {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const absSec = Math.abs(diffSec);
    if (absSec < 3600) {
      const m = Math.round(diffSec / 60);
      relative = rtf.format(m, "minute");
    } else if (absSec < 86400) {
      const h = Math.round(diffSec / 3600);
      relative = rtf.format(h, "hour");
    } else {
      const days = Math.round(diffSec / 86400);
      relative = rtf.format(days, "day");
    }
  }

  return (
    <span className="flex flex-col gap-1 sm:items-end">
      <span>{absolute}</span>
      <span className="text-xs font-normal text-muted">{relative}</span>
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/70 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <p className="text-sm font-medium text-muted">{label}</p>
      <div className="text-sm font-semibold text-foreground sm:text-right">{value}</div>
    </div>
  );
}

function NextStepAction({ courseId, nextStep }: { courseId: string; nextStep: string | null }) {
  if (!nextStep) return null;

  const linkClass = ["btn btn-primary min-h-11 rounded-xl px-6 shadow-sm transition-transform duration-150 active:scale-[0.98]", courseUi.focusRing].join(
    " ",
  );

  if (nextStep === "ENROLL") {
    return (
      <Link className={linkClass} href={`/learner/courses/${courseId}/enroll`}>
        Enroll
      </Link>
    );
  }
  if (nextStep === "START" || nextStep === "RESUME") {
    return (
      <Link className={linkClass} href={`/learner/courses/${courseId}/exam`}>
        {nextStep === "RESUME" ? "Resume exam" : "Start exam"}
      </Link>
    );
  }
  if (nextStep === "RESULT") {
    return (
      <Link className={linkClass} href={`/learner/courses/${courseId}/result`}>
        View result
      </Link>
    );
  }

  return null;
}

export default function CourseEntryView({ courseId }: { courseId: string }) {
  const { course, enrollment, attempt, nextStep, loading, error } = useGetCourseEntry(courseId);

  const title = course?.title ?? "Course overview";
  const subtitle = loading ? "Loading course details…" : error ? error : "Overview and your progress for this course.";

  return (
    <CoursePageShell
      title={title}
      subtitle={subtitle}
      actions={<NextStepAction courseId={courseId} nextStep={nextStep} />}
    >
      {loading && !error ? (
        <CourseMotionFade>
          <div className="space-y-6" aria-busy aria-label="Loading course">
            <CoursePanelSkeleton rows={4} />
          </div>
        </CourseMotionFade>
      ) : error ? (
        <CourseAlert variant="error" title="Could not load course">
          {error}
        </CourseAlert>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
          <motion.section variants={slideUp} className="space-y-0 rounded-xl bg-muted/10 p-1 sm:p-2">
            <div className="rounded-xl border border-border/60 bg-background/90 px-4 py-2 sm:px-5">
              <InfoRow
                label="Enrolled"
                value={
                  enrollment?.isEnrolled ? <span className="badge-success">Yes</span> : <span className="badge-muted">No</span>
                }
              />
              <InfoRow label="Next step" value={<span className="badge-admin-accent">{nextStep ?? "—"}</span>} />
            </div>
          </motion.section>

          <motion.section variants={slideUp} className="space-y-4">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Attempt</h2>
            {attempt ? (
              <div className="space-y-0 rounded-xl border border-border/60 bg-background/90 px-4 py-2 sm:px-5">
                <InfoRow label="Status" value={<span className="badge-admin-accent">{attempt.status}</span>} />
                <InfoRow label="Attempt no." value={attempt.attemptNo} />
                <InfoRow label="Remaining attempts" value={attempt.remainingAttempts} />
                <InfoRow
                  label="Passed"
                  value={
                    attempt.passed === null ? (
                      "—"
                    ) : attempt.passed ? (
                      <span className="badge-success">Yes</span>
                    ) : (
                      <span className="badge-error">No</span>
                    )
                  }
                />
                <InfoRow
                  label="Cooldown active"
                  value={
                    attempt.cooldownActive ? <span className="badge-error">Yes</span> : <span className="badge-success">No</span>
                  }
                />
                <InfoRow
                  label="Cooldown until"
                  value={
                    attempt.cooldownUntil && attempt.cooldownUntil.trim() !== "" ? (
                      <CooldownUntilValue iso={attempt.cooldownUntil} />
                    ) : (
                      "—"
                    )
                  }
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/5 px-4 py-8 text-center">
                <p className="text-sm text-muted">No attempt started yet.</p>
              </div>
            )}
          </motion.section>
        </motion.div>
      )}
    </CoursePageShell>
  );
}
