"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// UI Components
import { WizardHeader } from "./ui/WizardHeader";
import { WizardStepper } from "./ui/WizardStepper";
import { StatusBanner } from "./ui/StatusBanner";

// Step Components

import { BasicInfoForm } from "./steps/1-BasicInfoForm";
import { EnrollmentFormBuilder } from "./steps/2-EnrollmentForm";
import { QuizBuilder } from "./steps/3-QuizBuilder";
import { ExamSettingsForm } from "./steps/4-ExamSettingsForm";
import { CertificateUpload } from "./steps/5-CertificateUpload";
import { ReviewAndPublish } from "./steps/6-ReviewAndPublish";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
const ADMIN_TOKEN_KEY = "adminAccessToken";
const DEMO_MODE = false; // Switch to false to enable real API calls

export const authFetch = async (path: string, init: RequestInit = {}) => {
    if (DEMO_MODE) throw new Error("DEMO_MODE is enabled. API calls are disabled.");
    const token = typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_TOKEN_KEY) : null;
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    if (res.status === 401) {
        if (typeof window !== "undefined") window.localStorage.removeItem(ADMIN_TOKEN_KEY);
        throw new Error("Admin session expired. Please sign in again.");
    }
    return res;
};

export default function AdminCourseBuilder() {
    const router = useRouter();
    const params = useParams();
    const routeCourseIdRaw = (params as Record<string, string | string[] | undefined>)?.courseId;
    const routeCourseId = Array.isArray(routeCourseIdRaw) ? routeCourseIdRaw[0] : routeCourseIdRaw;

    const [step, setStep] = useState<number>(1);
    const [courseId, setCourseId] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [editMode, setEditMode] = useState(false);
    const [courseData, setCourseData] = useState<any>(null);

    // Load Full Course Data for Edit Mode or Review Step
    const loadFullCourseData = async (id: string) => {
        setError(""); setSuccess("");
        try {
            if (DEMO_MODE) {
                setCourseData({ course: { id, title: "Demo Course" } });
                return;
            }
            const res = await authFetch(`/api/admin/courses/${id}/full`);
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            setCourseData(json.data);
        } catch (e: any) { setError(e?.message ?? "Failed to load course data"); }
    };

    useEffect(() => {
        if (!routeCourseId || (courseId === routeCourseId && editMode)) return;
        setCourseId(routeCourseId);
        setEditMode(true);
        void loadFullCourseData(routeCourseId);
        setStep(2);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeCourseId]);

    const handleReset = () => {
        setCourseId(null); setEditMode(false); setStep(1); setError(""); setSuccess(""); setCourseData(null);
        try { router.replace("/admin/courses"); } catch { /* ignore */ }
    };

    // --- API Submission Handlers ---

    const handleBasicInfoSubmit = async (formData: FormData) => {
        setError(""); setSuccess("");
        try {
            if (DEMO_MODE) {
                setCourseId(`demo-${Date.now()}`); setStep(2);
                setSuccess("DEMO: Course created. Continue to enrollment form."); return;
            }
            const res = await authFetch(`/api/admin/courses`, { method: "POST", body: formData });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            setCourseId(json.data.id);
            try { router.replace(`/admin/courses/${json.data.id}`); } catch { /* ignore */ }
            setStep(2); setSuccess("Course created. Continue to enrollment.");
        } catch (e: any) { setError(e?.message ?? "Failed to create course"); }
    };

    const handleEnrollmentSubmit = async (data: any) => {
        setError(""); setSuccess("");
        try {
            if (DEMO_MODE) { setStep(3); setSuccess("DEMO: Enrollment saved."); return; }
            const res = await authFetch(`/api/admin/courses/${courseId}/enrollment-form`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            setStep(3); setSuccess("Enrollment form saved.");
        } catch (e: any) { setError(e?.message ?? "Failed to save enrollment"); }
    };

    const handleQuizSubmit = async (data: any) => {
        setError(""); setSuccess("");
        try {
            if (DEMO_MODE) { setStep(4); setSuccess("DEMO: Quiz saved."); return; }
            const res = await authFetch(`/api/admin/courses/${courseId}/quiz`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            setStep(4); setSuccess("Quiz saved.");
        } catch (e: any) { setError(e?.message ?? "Failed to save quiz"); }
    };

    const handleExamSettingsSubmit = async (data: any) => {
        setError(""); setSuccess("");
        try {
            if (DEMO_MODE) { setStep(5); setSuccess("DEMO: Exam settings saved."); return; }
            const res = await authFetch(`/api/admin/courses/${courseId}/exam-settings`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            setStep(5); setSuccess("Exam settings saved.");
        } catch (e: any) { setError(e?.message ?? "Failed to save exam settings"); }
    };

    const handleCertificateSubmit = async (formData: FormData) => {
        setError(""); setSuccess("");
        try {
            if (DEMO_MODE) {
                setStep(6);
                await loadFullCourseData(courseId!);
                setSuccess("DEMO: Certificate uploaded. Ready for review.");
                return;
            }
            const res = await authFetch(`/api/admin/courses/${courseId}/certificate`, { method: "POST", body: formData });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            await loadFullCourseData(courseId!); // Load fresh data for Step 6 Review
            setStep(6); setSuccess("Certificate uploaded. Please review your course.");
        } catch (e: any) { setError(e?.message ?? "Failed to upload certificate"); }
    };

    const handlePublish = async () => {
        setError(""); setSuccess("");
        try {
            if (DEMO_MODE) { setSuccess("DEMO: Course published."); return; }
            const res = await authFetch(`/api/admin/courses/${courseId}/status`, {
                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PUBLISHED" }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            setSuccess("Course published successfully!");
        } catch (e: any) { setError(e?.message ?? "Failed to publish course"); }
    };

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <WizardHeader editMode={editMode} courseId={courseId} onReset={handleReset} />
            <WizardStepper currentStep={step} courseId={courseId} onStepClick={setStep} />
            <StatusBanner error={error} success={success} />

            {step === 1 && <BasicInfoForm initialData={courseData?.course} onSubmit={handleBasicInfoSubmit} />}
            {step === 2 && <EnrollmentFormBuilder initialData={courseData?.enrollmentForm} onSubmit={handleEnrollmentSubmit} onBack={() => setStep(1)} />}
            {step === 3 && <QuizBuilder initialData={courseData?.quiz} onSubmit={handleQuizSubmit} onBack={() => setStep(2)} />}
            {step === 4 && <ExamSettingsForm initialData={courseData?.examSettings} onSubmit={handleExamSettingsSubmit} onBack={() => setStep(3)} />}
            {step === 5 && <CertificateUpload onSubmit={handleCertificateSubmit} onBack={() => setStep(4)} />}
            {step === 6 && courseId && (
                <ReviewAndPublish
                    courseId={courseId}
                    reviewData={courseData}
                    onLoadData={() => loadFullCourseData(courseId)}
                    onPublish={handlePublish}
                    onBack={() => setStep(5)}
                />
            )}
        </div>
    );
}