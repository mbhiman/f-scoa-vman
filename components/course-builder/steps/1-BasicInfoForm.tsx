import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, ChevronRight, Image as ImageIcon } from "lucide-react";
import { TextInput, TextareaInput, btnPrimaryClass } from "../ui/FormInputs";

const courseBasicSchema = z.object({
    title: z.string().trim().min(1, "Course title is required"),
    description: z.string().trim().optional(),
    is_ncvet: z.boolean(),
    thumbnail: z.any().optional(),
});

type CourseBasicForm = z.infer<typeof courseBasicSchema>;

interface BasicInfoFormProps {
    initialData?: any;
    onSubmit: (formData: FormData, rawValues: CourseBasicForm) => Promise<void>;
}

export function BasicInfoForm({ initialData, onSubmit }: BasicInfoFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CourseBasicForm>({
        resolver: zodResolver(courseBasicSchema),
        mode: "onChange",
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            is_ncvet: initialData?.is_ncvet ?? false,
            thumbnail: initialData?.thumbnailUrl || undefined
        },
    });

    const currentThumbnail = form.watch("thumbnail");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (currentThumbnail instanceof File) {
            const url = URL.createObjectURL(currentThumbnail);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof currentThumbnail === "string" && currentThumbnail.trim() !== "") {
            setPreviewUrl(currentThumbnail);
        } else {
            setPreviewUrl(null);
        }
    }, [currentThumbnail]);

    const handleSubmit = async (values: CourseBasicForm) => {
        setIsSubmitting(true);
        const fd = new FormData();
        fd.append("title", values.title);
        if (values.description) fd.append("description", values.description);
        fd.append("is_ncvet", String(values.is_ncvet));
        if (values.thumbnail instanceof File) fd.append("thumbnail", values.thumbnail);

        await onSubmit(fd, values);
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col admin-card p-4 sm:p-6 lg:p-8">

            <div className="border-b border-admin-border pb-3 sm:pb-4 mb-5 sm:mb-6">
                <h2 className="text-base sm:text-lg font-bold text-admin-fg">Basic Information</h2>
                <p className="text-xs sm:text-sm text-admin-muted-foreground mt-0.5">Define the core identity and presentation of your course.</p>
            </div>

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">

                {/* Left Column: Text Inputs */}
                <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
                        <TextInput
                            label="Course Title *"
                            placeholder="e.g. Full Stack Development"
                            error={form.formState.errors.title?.message}
                            {...form.register("title")}
                        />

                        <div className="flex items-center gap-3 rounded-lg border border-admin-border bg-admin-bg/50 px-3 sm:px-4 py-2 sm:py-2.5 mt-1 md:mt-7 shadow-sm">
                            <input
                                type="checkbox"
                                {...form.register("is_ncvet")}
                                className="w-4 h-4 rounded border-admin-border text-admin-primary focus:ring-admin-primary bg-admin-card cursor-pointer shrink-0"
                            />
                            <div className="flex flex-col">
                                <span className="text-[13px] sm:text-sm font-semibold text-admin-fg leading-none">NCVET Certified</span>
                                <span className="text-[10px] sm:text-[11px] text-admin-muted-foreground mt-1 leading-tight">Toggle if this aligns with NCVET standards.</span>
                            </div>
                        </div>
                    </div>

                    <TextareaInput
                        label="Course Description"
                        placeholder="Provide a brief overview..."
                        error={form.formState.errors.description?.message}
                        rows={3}
                        // Mobile: Force smaller height. Desktop: Revert to 120px min-height
                        className="[&>textarea]:min-h-20! sm:[&>textarea]:min-h-30!"
                        {...form.register("description")}
                    />
                </div>

                {/* Right Column: Thumbnail Upload & Preview */}
                <div className="lg:col-span-1 flex flex-col">
                    <label className="text-[13px] sm:text-sm font-medium text-admin-fg mb-1.5 block">Course Thumbnail</label>
                    <Controller
                        control={form.control}
                        name="thumbnail"
                        render={({ field }) => (
                            // Mobile: 120px height. Desktop: 160px height
                            <div className="relative flex-1 min-h-30 sm:min-h-40 w-full">
                                <label className={`absolute inset-0 flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden group ${form.formState.errors.thumbnail ? 'border-red-500 bg-red-500/5' : 'border-admin-border bg-admin-bg hover:bg-admin-muted/10'}`}>

                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Thumbnail Preview" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-40" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <div className="flex items-center gap-1.5 bg-admin-card/90 backdrop-blur-sm text-admin-fg text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-admin-border">
                                                    <ImageIcon className="w-3.5 h-3.5" /> Change Image
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-4 text-center">
                                            <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 text-admin-muted-foreground/60 mb-2" />
                                            <p className="text-[11px] sm:text-xs font-semibold text-admin-fg">Click to upload</p>
                                            <p className="text-[10px] sm:text-[11px] text-admin-muted-foreground mt-0.5">PNG, JPG up to 5MB</p>
                                        </div>
                                    )}

                                    <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => field.onChange(e.target.files?.[0])} />
                                </label>
                            </div>
                        )}
                    />
                    {form.formState.errors.thumbnail && (
                        <p className="mt-1.5 text-xs text-red-500">{(form.formState.errors.thumbnail as any).message}</p>
                    )}
                </div>
            </div>

            {/* Compact Footer */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 flex flex-col sm:flex-row justify-end border-t border-admin-border">
                <button type="submit" disabled={isSubmitting || !form.formState.isValid} className={`${btnPrimaryClass} w-full sm:w-auto shadow-sm`}>
                    {isSubmitting ? "Processing..." : "Save & Continue"} <ChevronRight className="w-4 h-4 ml-1.5" />
                </button>
            </div>
        </form>
    );
}