import React from "react";
import { BookOpen, LayoutList, FileText, Settings, Award, Check } from "lucide-react";

interface WizardStepperProps {
    currentStep: number;
    courseId: string | null;
    onStepClick: (step: number) => void;
}

export function WizardStepper({ currentStep, courseId, onStepClick }: WizardStepperProps) {
    const stepsList = [
        { num: 1, label: "Basic Info", icon: BookOpen },
        { num: 2, label: "Enrollment", icon: LayoutList },
        { num: 3, label: "Quiz", icon: FileText },
        { num: 4, label: "Exam", icon: Settings },
        { num: 5, label: "Certificate", icon: Award },
        { num: 6, label: "Review", icon: Check }
    ];

    return (
        <div className="mb-8 overflow-x-auto pb-4">
            <div className="flex min-w-max items-center justify-between gap-4">
                {stepsList.map((s, idx) => {
                    const isActive = currentStep === s.num;
                    const isCompleted = currentStep > s.num;
                    const isLocked = s.num === 1 && !!courseId; // no "update course" endpoint in v2 contract
                    return (
                        <React.Fragment key={s.num}>
                            <div
                                className={[
                                    "flex flex-col items-center gap-2 transition-colors",
                                    isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                                    isActive ? "text-admin-primary" : isCompleted ? "text-admin-fg" : "text-admin-muted-foreground",
                                ].join(" ")}
                                onClick={() => {
                                    if (isLocked) return;
                                    if (courseId || s.num === 1) onStepClick(s.num);
                                }}
                            >
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${isActive ? "border-admin-primary bg-admin-primary/10" : isCompleted ? "border-admin-fg bg-admin-fg text-admin-bg" : "border-admin-border bg-admin-bg"}`}>
                                    <s.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider">{s.label}</span>
                            </div>
                            {idx < stepsList.length - 1 && (
                                <div className={`h-0.5 flex-1 transition-colors ${isCompleted ? "bg-admin-fg" : "bg-admin-border"}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}