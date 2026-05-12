"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animation/animations";
import CoursePageShell from "./CoursePageShell";
import { useGetEnrollmentForm, useSubmitEnrollment } from "@/hooks/studentCourses";
import type { EnrollmentField, EnrollmentGroup } from "@/hooks/studentCourses/useGetEnrollmentForm";
import {
  CourseAlert,
  CourseMotionFade,
  CoursePanelSkeleton,
  CourseSectionTitle,
  CourseSelectableRow,
  courseUi,
} from "./course-ui";
import { useRouter } from "next/navigation";

const router = useRouter();

function buildInitialAnswers(groups: EnrollmentGroup[], ungroupedFields: EnrollmentField[]) {
  const allFields = [...groups.flatMap((g) => g.fields), ...ungroupedFields];
  const init: Record<string, unknown> = {};
  allFields.forEach((f) => {
    if (f.type === "checkbox") init[f.fieldKey] = false;
    else init[f.fieldKey] = "";
  });
  return init;
}

const FieldControl = React.memo(function FieldControl({
  field,
  value,
  onChange,
}: {
  field: EnrollmentField;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const commonLabel = (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <label htmlFor={`field-${field.fieldKey}`} className="text-sm font-medium text-foreground">
        {field.label}{" "}
        {field.required ? (
          <span className="text-red-500" aria-hidden>
            *
          </span>
        ) : null}
        {field.required ? <span className="sr-only">(required)</span> : null}
      </label>
      <span className="rounded-md bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
        {field.type}
      </span>
    </div>
  );

  if (field.type === "select" || field.type === "radio") {
    const options = Array.isArray(field.config?.options) ? field.config?.options : [];
    return (
      <div className="space-y-2.5">
        {commonLabel}
        {field.type === "select" ? (
          <div className="relative">
            <select
              id={`field-${field.fieldKey}`}
              className={[courseUi.inputElevated, "appearance-none pr-11", courseUi.focusRing].join(" ")}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">Select…</option>
              {options.map((o) => (
                <option key={`${o.value}`} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        ) : (
          <div className="grid gap-2" role="radiogroup" aria-labelledby={`field-${field.fieldKey}-legend`}>
            <span id={`field-${field.fieldKey}-legend`} className="sr-only">
              {field.label}
            </span>
            {options.map((o) => (
              <CourseSelectableRow
                key={`${o.value}`}
                name={field.fieldKey}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
                label={o.label}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label
        className={[
          "flex min-h-[52px] cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3.5 transition-[border-color,background-color,box-shadow] duration-200",
          courseUi.cardRaise,
          courseUi.focusRing,
        ].join(" ")}
      >
        <span className="text-sm font-medium text-foreground">
          {field.label}{" "}
          {field.required ? (
            <span className="text-red-500" aria-hidden>
              *
            </span>
          ) : null}
        </span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 shrink-0 rounded-md border-border text-primary focus:ring-primary/25"
        />
      </label>
    );
  }

  const inputType =
    field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "date" ? "date" : "text";

  if (field.type === "textarea") {
    return (
      <div className="space-y-2.5">
        {commonLabel}
        <textarea
          id={`field-${field.fieldKey}`}
          className={[courseUi.inputElevated, "min-h-32 resize-y", courseUi.focusRing].join(" ")}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={typeof field.config?.placeholder === "string" ? field.config.placeholder : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {commonLabel}
      <input
        id={`field-${field.fieldKey}`}
        className={[courseUi.inputElevated, courseUi.focusRing].join(" ")}
        type={inputType}
        value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
        onChange={(e) =>
          onChange(field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)
        }
        placeholder={typeof field.config?.placeholder === "string" ? field.config.placeholder : undefined}
      />
    </div>
  );
});

export default function CourseEnrollView({ courseId }: { courseId: string }) {
  const formState = useGetEnrollmentForm(courseId);
  const submitState = useSubmitEnrollment(courseId);

  const initialAnswers = useMemo(() => buildInitialAnswers(formState.groups, formState.ungroupedFields), [
    formState.groups,
    formState.ungroupedFields,
  ]);

  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers);

  React.useEffect(() => {
    setAnswers(initialAnswers);
  }, [initialAnswers]);

  const title = formState.form?.name ?? "Course enrollment";
  const subtitle = formState.loading
    ? "Loading enrollment form…"
    : formState.alreadyEnrolled
      ? "You are already enrolled in this course."
      : formState.error
        ? formState.error
        : "Complete the form below to enroll.";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitState.submit(answers);
    router.push(`/learner/courses/${courseId}/exam` );
  };

  const backClass = ["btn rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-[transform,background-color] duration-150 hover:bg-muted/30 active:scale-[0.98]", courseUi.focusRing].join(
    " ",
  );

  return (
    <CoursePageShell
      title={title}
      subtitle={subtitle}
      actions={
        <Link className={backClass} href={`/courses/${courseId}`}>
          Back
        </Link>
      }
    >
      {formState.loading && !formState.error ? (
        <CourseMotionFade>
          <div className="space-y-6" aria-busy aria-label="Loading enrollment form">
            <CoursePanelSkeleton rows={6} />
          </div>
        </CourseMotionFade>
      ) : formState.alreadyEnrolled ? (
        <div className="space-y-6">
          <CourseAlert variant="info" title="Already enrolled">
            Nothing else is required here — your enrollment is on file.
          </CourseAlert>
          <Link className="btn btn-primary min-h-11 rounded-xl px-6" href={`/courses/${courseId}/exam`}>
            Go to exam
          </Link>
        </div>
      ) : formState.error ? (
        <CourseAlert variant="error" title="Could not load form">
          {formState.error}
        </CourseAlert>
      ) : (
        <motion.form
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          onSubmit={onSubmit}
          className="space-y-8"
          noValidate
        >
          {submitState.error ? (
            <CourseAlert variant="error" title="Submission failed">
              {submitState.error}
            </CourseAlert>
          ) : null}

          {submitState.success ? (
            <CourseAlert variant="success" title="Success">
              Enrollment submitted successfully.
            </CourseAlert>
          ) : null}

          {submitState.validationErrors.length > 0 ? (
            <CourseAlert variant="warning" title="Please fix the following">
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                {submitState.validationErrors.map((v, idx) => (
                  <li key={`${v.field}-${idx}`}>
                    <span className="font-semibold">{v.field}</span>: {v.message}
                  </li>
                ))}
              </ul>
            </CourseAlert>
          ) : null}

          {formState.groups.map((group) => (
            <motion.section key={group.id} variants={slideUp} className="space-y-5">
              <CourseSectionTitle>{group.label}</CourseSectionTitle>
              <div className="grid gap-5 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <FieldControl
                      field={field}
                      value={answers[field.fieldKey]}
                      onChange={(next) => setAnswers((prev) => ({ ...prev, [field.fieldKey]: next }))}
                    />
                  </div>
                ))}
              </div>
            </motion.section>
          ))}

          {formState.ungroupedFields.length > 0 ? (
            <motion.section variants={slideUp} className="space-y-5">
              <CourseSectionTitle>Additional information</CourseSectionTitle>
              <div className="grid gap-5 sm:grid-cols-2">
                {formState.ungroupedFields.map((field) => (
                  <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <FieldControl
                      field={field}
                      value={answers[field.fieldKey]}
                      onChange={(next) => setAnswers((prev) => ({ ...prev, [field.fieldKey]: next }))}
                    />
                  </div>
                ))}
              </div>
            </motion.section>
          ) : null}

          <motion.div variants={slideUp} className="flex flex-col gap-4 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              Course ID: <span className="font-mono text-foreground/90">{courseId}</span>
            </p>
            <button
              type="submit"
              className={[
                "btn btn-primary min-h-11 min-w-[200px] rounded-xl px-8 transition-[transform,opacity] duration-150 enabled:active:scale-[0.98]",
                submitState.loading || formState.loading ? "cursor-wait opacity-90" : "",
                courseUi.focusRing,
              ].join(" ")}
              disabled={submitState.loading || formState.loading}
              aria-busy={submitState.loading}
            >
              {submitState.loading ? "Submitting…" : "Submit enrollment"}
            </button>
          </motion.div>
        </motion.form>
      )}
    </CoursePageShell>
  );
}
