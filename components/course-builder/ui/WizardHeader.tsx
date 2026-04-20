import { Plus } from "lucide-react";

interface WizardHeaderProps {
    editMode: boolean;
    courseId: string | null;
    onReset: () => void;
}

export function WizardHeader({ editMode, courseId, onReset }: WizardHeaderProps) {
    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-admin-fg tracking-tight">Course Builder</h1>
                <p className="mt-2 text-sm text-admin-muted-foreground">
                    {editMode ? `Editing Course ID: ${courseId}` : "Design and publish a new course curriculum."}
                </p>
            </div>
            {courseId && (
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg font-medium transition-all px-5 py-2.5 border border-admin-border bg-transparent text-admin-fg hover:bg-admin-muted/30 active:scale-95"
                    onClick={onReset}
                >
                    <Plus className="w-4 h-4 mr-2" /> Start Fresh
                </button>
            )}
        </div>
    );
}