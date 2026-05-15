import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Clock, Target, RotateCcw, TimerReset } from "lucide-react";
import { TextInput, btnPrimaryClass, btnSecondaryClass } from "../ui/FormInputs";

const examSettingsSchema = z.object({
    duration_minutes: z.number().int().min(1, "Min 1 minute"),
    passing_percentage: z.number().min(0).max(100, "0 to 100"),
    max_attempts: z.number().int().min(1, "Min 1 attempt"),
    cooldown_hours: z.number().int().min(0, "Min 0 hours"),
});

type ExamSettingsFormType = z.infer<typeof examSettingsSchema>;

interface ExamSettingsFormProps {
    initialData?: any;
    onSubmit: (data: ExamSettingsFormType) => Promise<void>;
    onBack: () => void;
}

export function ExamSettingsForm({ initialData, onSubmit, onBack }: ExamSettingsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ExamSettingsFormType>({
        resolver: zodResolver(examSettingsSchema),
        mode: "onChange",
        defaultValues: {
            duration_minutes: initialData?.duration_minutes ?? 60,
            passing_percentage: initialData?.passing_percentage ?? 70,
            max_attempts: initialData?.max_attempts ?? 1,
            cooldown_hours: initialData?.cooldown_hours ?? 720,
        },
    });

    const handleSubmit = async (values: ExamSettingsFormType) => {
        setIsSubmitting(true);
        await onSubmit(values);
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6 admin-card p-5 md:p-6 lg:p-8">
            <div className="border-b border-admin-border pb-4">
                <h2 className="text-lg font-bold text-admin-fg">Exam Parameters</h2>
                <p className="text-sm text-admin-muted-foreground mt-0.5">Establish the rules, grading threshold, and limits for the evaluation.</p>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 pt-2">

                {/* Duration Card */}
                <div className="flex flex-col p-5 rounded-xl border border-admin-border bg-admin-bg/50 focus-within:ring-1 focus-within:ring-admin-primary/50 focus-within:border-admin-primary transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-admin-fg">Time Limit</h3>
                            <p className="text-[11px] text-admin-muted-foreground">In minutes</p>
                        </div>
                    </div>
                    <TextInput
                        type="number"
                        placeholder="e.g. 60"
                        error={form.formState.errors.duration_minutes?.message}
                        {...form.register("duration_minutes", { valueAsNumber: true })}
                    />
                </div>

                {/* Passing Grade Card */}
                <div className="flex flex-col p-5 rounded-xl border border-admin-border bg-admin-bg/50 focus-within:ring-1 focus-within:ring-admin-primary/50 focus-within:border-admin-primary transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-admin-fg">Passing Score</h3>
                            <p className="text-[11px] text-admin-muted-foreground">Percentage (0-100)</p>
                        </div>
                    </div>
                    <TextInput
                        type="number"
                        placeholder="e.g. 70"
                        error={form.formState.errors.passing_percentage?.message}
                        {...form.register("passing_percentage", { valueAsNumber: true })}
                    />
                </div>

                {/* Retries Card */}
                <div className="flex flex-col p-5 rounded-xl border border-admin-border bg-admin-bg/50 focus-within:ring-1 focus-within:ring-admin-primary/50 focus-within:border-admin-primary transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-admin-fg">Max Retries</h3>
                            <p className="text-[11px] text-admin-muted-foreground">Total allowed attempts</p>
                        </div>
                    </div>
                    <TextInput
                        type="number"
                        placeholder="e.g. 3"
                        error={form.formState.errors.max_attempts?.message}
                        {...form.register("max_attempts", { valueAsNumber: true })}
                    />
                </div>

                {/* Cooldown Card */}
                <div className="flex flex-col p-5 rounded-xl border border-admin-border bg-admin-bg/50 focus-within:ring-1 focus-within:ring-admin-primary/50 focus-within:border-admin-primary transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                            <TimerReset className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-admin-fg">Cooldown</h3>
                            <p className="text-[11px] text-admin-muted-foreground">Hours between retries</p>
                        </div>
                    </div>
                    <TextInput
                        type="number"
                        placeholder="e.g. 24"
                        error={form.formState.errors.cooldown_hours?.message}
                        {...form.register("cooldown_hours", { valueAsNumber: true })}
                    />
                </div>

            </div>

            <div className="mt-4 pt-6 flex flex-col sm:flex-row justify-between gap-4 border-t border-admin-border">
                <button type="button" onClick={onBack} disabled={isSubmitting} className={`${btnSecondaryClass} w-full sm:w-auto`}>
                    Back
                </button>
                <button type="submit" disabled={isSubmitting || !form.formState.isValid} className={`${btnPrimaryClass} w-full sm:w-auto`}>
                    {isSubmitting ? "Processing..." : "Save & Continue"} <ChevronRight className="w-4 h-4 ml-1.5" />
                </button>
            </div>
        </form>
    );
}