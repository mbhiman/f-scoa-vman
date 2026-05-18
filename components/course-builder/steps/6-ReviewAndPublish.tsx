import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Save, BookOpen, ClipboardList, Settings, Award,
    CheckCircle2, Clock, Target, RotateCcw, Hourglass
} from "lucide-react";
import { btnPrimaryClass, btnSecondaryClass, baseInputClass } from "../ui/FormInputs";

interface ReviewAndPublishProps {
    courseId: string;
    reviewData: any;
    onLoadData: () => Promise<void>;
    onPublish: () => Promise<void>;
    onBack: () => void;
}

export function ReviewAndPublish({ courseId, reviewData, onLoadData, onPublish, onBack }: ReviewAndPublishProps) {
    const router = useRouter();
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLoad = async () => {
        setIsLoading(true);
        await onLoadData();
        setIsLoading(false);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        await onPublish();
        // Artificial delay for the success toast before routing
        setTimeout(() => {
            router.push("/admin/courses");
        }, 1500);
    };

    const basic = reviewData?.basicInfo || {};
    const enroll = reviewData?.enrollmentForm || {};
    const quiz = reviewData?.quiz || {};
    const exam = reviewData?.examSettings || {};
    const cert = reviewData?.certificate || {};

    // Grouping helper for the True Form Preview
    const fields = enroll.fields || [];
    const groups = enroll.groups || [];
    const ungroupedFields = fields.filter((f: any) => !f.groupTempId);
    const groupedFields = groups.map((g: any) => ({
        ...g,
        fields: fields.filter((f: any) => f.groupTempId === g.tempId).sort((a: any, b: any) => a.sort_order - b.sort_order)
    })).sort((a: any, b: any) => a.sort_order - b.sort_order);

    const renderPreviewField = (f: any, idx: number) => {
        const isOptions = f.type === "select" || f.type === "radio";
        return (
            <div key={idx} className="flex flex-col gap-1.5 mb-4">
                <label className="text-[11px] font-semibold text-admin-fg">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                {f.type === "textarea" ? (
                    <textarea disabled className={`${baseInputClass} py-1.5 px-3 text-[12px] bg-admin-bg/30 min-h-15 opacity-70`} placeholder={f.config?.placeholder || "..."} />
                ) : isOptions ? (
                    <select disabled className={`${baseInputClass} py-1.5 px-3 text-[12px] bg-admin-bg/30 opacity-70`}>
                        <option>Select an option...</option>
                        {(f.config?.options || []).map((o: any, i: number) => <option key={i}>{o.label}</option>)}
                    </select>
                ) : (
                    <input type={f.type === 'checkbox' ? 'checkbox' : 'text'} disabled className={`${baseInputClass} ${f.type !== 'checkbox' ? 'py-1.5 px-3 w-full' : 'w-4 h-4'} text-[12px] bg-admin-bg/30 opacity-70`} placeholder={f.config?.placeholder || "..."} />
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col bg-admin-card rounded-xl border border-admin-border/50 p-4 sm:p-8">
            <div className="border-b border-admin-border/40 pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-[15px] sm:text-lg font-bold text-admin-fg">Pre-Flight Review</h2>
                    <p className="text-[11px] sm:text-[13px] text-admin-muted-foreground mt-1">Verify your configuration and preview the student experience.</p>
                </div>
                <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing || !reviewData}
                    className={`${btnPrimaryClass} bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto text-[13px] sm:text-sm active:scale-[0.98] cursor-pointer`}
                >
                    <Save className="w-4 h-4 mr-2" /> {isPublishing ? "Publishing..." : "Publish Course Live"}
                </button>
            </div>

            {!reviewData ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 border border-dashed border-admin-border/50 rounded-lg">
                    <p className="text-admin-muted-foreground text-[12px] sm:text-[13px] font-medium mb-4">Course data is not currently loaded in memory.</p>
                    <button type="button" className={`${btnSecondaryClass} text-[12px] sm:text-[13px]`} onClick={handleLoad} disabled={isLoading}>
                        {isLoading ? "Fetching Configuration..." : "Load Course Data"}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-10">

                    {/* TOP SECTION: Identity & Rules */}
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

                        <div className="lg:col-span-2 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-4 h-4 text-admin-primary" />
                                <h3 className="text-[12px] font-bold text-admin-fg uppercase tracking-wider">Course Identity</h3>
                            </div>
                            <h4 className="text-lg sm:text-xl font-bold text-admin-fg">{basic.title || "Untitled Course"}</h4>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[11px] text-admin-muted-foreground font-mono">ID: {courseId.substring(0, 8)}...</span>
                                {basic.is_ncvet && <span className="text-[10px] bg-admin-primary/10 text-admin-primary px-2 py-0.5 rounded font-semibold">NCVET</span>}
                            </div>
                            <p className="text-[12px] sm:text-[13px] text-admin-muted-foreground mt-3 leading-relaxed whitespace-pre-wrap max-w-2xl">
                                {basic.description || "No description provided for this course."}
                            </p>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <Settings className="w-4 h-4 text-admin-primary" />
                                <h3 className="text-[12px] font-bold text-admin-fg uppercase tracking-wider">Exam & Rules</h3>
                            </div>
                            <div className="flex flex-col gap-2.5 bg-admin-bg/30 p-4 rounded-lg border border-admin-border/40">
                                <div className="flex justify-between items-center text-[12px] sm:text-[13px]">
                                    <span className="text-admin-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Duration</span>
                                    <span className="font-semibold text-admin-fg">{exam.duration_minutes || 0} mins</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] sm:text-[13px]">
                                    <span className="text-admin-muted-foreground flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Passing Grade</span>
                                    <span className="font-semibold text-admin-fg">{exam.passing_percentage || 0}%</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] sm:text-[13px]">
                                    <span className="text-admin-muted-foreground flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> Retries</span>
                                    <span className="font-semibold text-admin-fg">{exam.max_attempts || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] sm:text-[13px]">
                                    <span className="text-admin-muted-foreground flex items-center gap-1.5"><Hourglass className="w-3.5 h-3.5" /> Cooldown</span>
                                    <span className="font-semibold text-admin-fg">{exam.cooldown_hours || 0} hrs</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* BOTTOM SECTION: True Form Preview */}
                    <div className="border-t border-admin-border/40 pt-8">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-admin-primary" />
                                <h3 className="text-[12px] font-bold text-admin-fg uppercase tracking-wider">Student Form Preview</h3>
                            </div>
                            <span className="text-[10px] bg-admin-muted/10 text-admin-muted-foreground px-2 py-1 rounded">Read Only View</span>
                        </div>

                        {/* Renders the actual form visually */}
                        <div className="max-w-2xl bg-admin-card border border-admin-border/50 rounded-xl p-5 sm:p-8 shadow-sm">
                            <h4 className="text-sm sm:text-base font-bold text-admin-fg mb-1">{enroll.name || "Enrollment Form"}</h4>
                            <p className="text-[11px] text-admin-muted-foreground mb-6 pb-4 border-b border-admin-border/40">Please complete all required fields to enroll.</p>

                            {ungroupedFields.map((f: any, idx: number) => renderPreviewField(f, idx))}

                            {groupedFields.map((g: any, gIdx: number) => (
                                <div key={gIdx} className="mt-6">
                                    <h5 className="text-[13px] font-semibold text-admin-fg mb-3">{g.label}</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                        {g.fields.map((f: any, fIdx: number) => renderPreviewField(f, fIdx))}
                                    </div>
                                </div>
                            ))}

                            {fields.length === 0 && (
                                <p className="text-[12px] text-admin-muted-foreground text-center py-6">No custom fields were added to this form.</p>
                            )}

                            <div className="mt-6 pt-4 border-t border-admin-border/40">
                                <button disabled className="w-full sm:w-auto bg-admin-primary/50 text-white text-[12px] font-semibold px-6 py-2 rounded-lg cursor-not-allowed">
                                    Complete Enrollment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-10 pt-4 flex flex-col sm:flex-row justify-start border-t border-admin-border/40">
                <button type="button" onClick={onBack} disabled={isPublishing} className={`${btnSecondaryClass} w-full sm:w-auto text-[13px] sm:text-sm cursor-pointer`}>
                    Back to Edit
                </button>
            </div>
        </div>
    );
}