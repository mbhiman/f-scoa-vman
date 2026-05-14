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
  CourseSelectableRow,
  courseUi,
} from "./course-ui";
import { useRouter } from "next/navigation";

/** Enrollment form-only styling — primary/secondary brand accents, soft surfaces */
const enroll = {
  section:
    "overflow-hidden rounded-2xl border border-border/70 bg-linear-to-b from-primary/[0.06] via-background/95 to-background shadow-[0_12px_40px_-28px_rgba(22,66,185,0.35)] ring-1 ring-black/4 dark:from-primary/15 dark:via-background/90 dark:to-background/80 dark:ring-white/8",
  sectionHeader:
    "border-b border-border/60 bg-muted/25 px-5 py-4 backdrop-blur-[2px] dark:bg-muted/15",
  sectionTitle: "font-heading text-base font-semibold tracking-tight text-foreground",
  sectionHint: "mt-1 text-xs leading-relaxed text-muted",
  sectionBody: "grid gap-6 p-5 sm:grid-cols-2 sm:p-6",
  label: "mb-1.5 block text-sm font-semibold tracking-tight text-foreground",
  requiredStar: "font-semibold text-rose-500 dark:text-rose-400",
  input: [
    courseUi.inputElevated,
    "border-border/70 bg-background/95 text-foreground shadow-inner shadow-black/[0.03]",
    "placeholder:text-muted/75",
    "transition-[border-color,box-shadow,background-color] duration-200",
    "hover:border-primary/25 hover:bg-background",
    "focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(22,66,185,0.14)]",
    "dark:focus:border-primary/55 dark:focus:shadow-[0_0_0_3px_rgba(64,128,248,0.18)]",
    courseUi.focusRing,
  ].join(" "),
  selectChevronWrap:
    "pointer-events-none absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20",
  radioGroup: "grid gap-2.5 rounded-xl bg-muted/15 p-3 ring-1 ring-inset ring-black/[0.04] dark:bg-muted/10 dark:ring-white/6",
  checkboxCard: [
    "flex min-h-[3.25rem] cursor-pointer items-center justify-between gap-4 rounded-xl border-2 border-border/70 bg-linear-to-br from-background to-muted/20 px-4 py-4 shadow-sm",
    "transition-[border-color,box-shadow,transform,background-color] duration-200",
    "hover:border-primary/30 hover:shadow-md hover:shadow-primary/5",
    "has-[:checked]:border-primary/40 has-[:checked]:bg-primary/[0.06] has-[:checked]:shadow-[inset_0_0_0_1px_rgba(22,66,185,0.12)]",
    "dark:has-[:checked]:bg-primary/10",
    courseUi.focusRing,
  ].join(" "),
  submitBar:
    "relative overflow-hidden rounded-2xl border border-primary/25 bg-linear-to-r from-primary/[0.14] via-primary/[0.07] to-primary/[0.04] p-px shadow-[0_16px_48px_-20px_rgba(22,66,185,0.45)] dark:from-primary/22 dark:via-primary/12 dark:to-primary/8",
  submitInner: "flex justify-end rounded-[15px] bg-background/75 px-4 py-5 backdrop-blur-md sm:px-6",
  submitBtn: [
    "btn btn-primary relative min-h-12 min-w-[min(100%,220px)] overflow-hidden rounded-xl px-10 text-[15px] font-semibold tracking-tight shadow-lg shadow-primary/30",
    "transition-[transform,box-shadow,opacity] duration-200",
    "enabled:hover:shadow-xl enabled:hover:shadow-primary/35 enabled:active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:opacity-70",
    courseUi.focusRing,
  ].join(" "),
  backBtn: [
    "btn inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/90 px-5 py-3 text-sm font-medium text-foreground shadow-sm",
    "transition-[transform,background-color,border-color,box-shadow] duration-200",
    "hover:border-primary/25 hover:bg-primary/[0.04] hover:shadow-md active:scale-[0.98]",
    courseUi.focusRing,
  ].join(" "),
} as const;

function EnrollSection({
  title,
  hint,
  children,
}: {
  title: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={enroll.section}>
      <div className={enroll.sectionHeader}>
        <h2 className={enroll.sectionTitle}>{title}</h2>
        {hint ? <p className={enroll.sectionHint}>{hint}</p> : null}
      </div>
      <div className={enroll.sectionBody}>{children}</div>
    </div>
  );
}

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
    <label htmlFor={`field-${field.fieldKey}`} className={enroll.label}>
      {field.label}{" "}
      {field.required ? (
        <span className={enroll.requiredStar} aria-hidden>
          *
        </span>
      ) : null}
      {field.required ? <span className="sr-only">(required)</span> : null}
    </label>
  );

  if (field.type === "select" || field.type === "radio") {
    const options = Array.isArray(field.config?.options) ? field.config?.options : [];
    return (
      <div className="space-y-2">
        {commonLabel}
        {field.type === "select" ? (
          <div className="relative">
            <select
              id={`field-${field.fieldKey}`}
              className={[enroll.input, "appearance-none py-3.5 pr-14"].join(" ")}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="">Choose an option…</option>
              {options.map((o) => (
                <option key={`${o.value}`} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className={enroll.selectChevronWrap} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        ) : (
          <div className={enroll.radioGroup} role="radiogroup" aria-labelledby={`field-${field.fieldKey}-legend`}>
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
      <label className={enroll.checkboxCard}>
        <span className="text-sm font-semibold leading-snug text-foreground">
          {field.label}{" "}
          {field.required ? (
            <span className={enroll.requiredStar} aria-hidden>
              *
            </span>
          ) : null}
        </span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-5 w-5 shrink-0 rounded-md border-2 border-border/80 text-primary transition-colors checked:border-primary checked:bg-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background"
        />
      </label>
    );
  }

  const inputType =
    field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "date" ? "date" : "text";

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        {commonLabel}
        <textarea
          id={`field-${field.fieldKey}`}
          className={[enroll.input, "min-h-36 resize-y leading-relaxed"].join(" ")}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={typeof field.config?.placeholder === "string" ? field.config.placeholder : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {commonLabel}
      <input
        id={`field-${field.fieldKey}`}
        className={enroll.input}
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
  const router = useRouter();
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

  return (
    <CoursePageShell
      title={title}
      subtitle={subtitle}
      actions={
        <Link className={enroll.backBtn} href={`/learner/courses/${courseId}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-muted">
            <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
          <Link
            className={[
              "btn btn-primary inline-flex min-h-12 items-center justify-center rounded-xl px-8 text-[15px] font-semibold shadow-lg shadow-primary/25 transition-[transform,box-shadow] duration-200 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]",
              courseUi.focusRing,
            ].join(" ")}
            href={`/learner/courses/${courseId}/exam`}
          >
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
          className="space-y-10"
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
            <motion.section key={group.id} variants={slideUp}>
              <EnrollSection title={group.label}>
                {group.fields.map((field) => (
                  <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <FieldControl
                      field={field}
                      value={answers[field.fieldKey]}
                      onChange={(next) => setAnswers((prev) => ({ ...prev, [field.fieldKey]: next }))}
                    />
                  </div>
                ))}
              </EnrollSection>
            </motion.section>
          ))}

          {formState.ungroupedFields.length > 0 ? (
            <motion.section variants={slideUp}>
              <EnrollSection
                title="Additional information"
                hint="Optional — helps us complete your enrollment smoothly."
              >
                {formState.ungroupedFields.map((field) => (
                  <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <FieldControl
                      field={field}
                      value={answers[field.fieldKey]}
                      onChange={(next) => setAnswers((prev) => ({ ...prev, [field.fieldKey]: next }))}
                    />
                  </div>
                ))}
              </EnrollSection>
            </motion.section>
          ) : null}

          <motion.div variants={slideUp} className={enroll.submitBar}>
            <div className={enroll.submitInner}>
              <button
                type="submit"
                className={[enroll.submitBtn, submitState.loading || formState.loading ? "cursor-wait" : ""].join(" ")}
                disabled={submitState.loading || formState.loading}
                aria-busy={submitState.loading}
              >
                {submitState.loading ? "Submitting…" : "Submit enrollment"}
              </button>
            </div>
          </motion.div>
        </motion.form>
      )}
    </CoursePageShell>
  );
}
