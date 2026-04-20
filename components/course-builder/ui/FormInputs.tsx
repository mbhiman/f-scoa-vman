import React from "react";

// Reusable Class String Constants
export const baseInputClass = "w-full rounded-lg border bg-admin-bg px-4 py-2.5 text-sm text-admin-fg outline-none transition-all placeholder:text-admin-muted-foreground focus:ring-1";
export const validBorderClass = "border-admin-border focus:border-admin-primary focus:ring-admin-primary";
export const errorBorderClass = "border-red-500 focus:border-red-500 focus:ring-red-500";
export const btnPrimaryClass = "inline-flex items-center justify-center rounded-lg font-medium transition-all px-5 py-2.5 bg-admin-primary text-white hover:bg-admin-primary-hover active:scale-95 disabled:opacity-60 disabled:pointer-events-none";
export const btnSecondaryClass = "inline-flex items-center justify-center rounded-lg font-medium transition-all px-5 py-2.5 border border-admin-border bg-transparent text-admin-fg hover:bg-admin-muted/30 active:scale-95 disabled:opacity-60 disabled:pointer-events-none";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => (
    <div>
        <label className="text-sm font-medium text-admin-fg mb-1.5 block">{label}</label>
        <input
            ref={ref}
            className={`${baseInputClass} ${error ? errorBorderClass : validBorderClass} ${className || ""}`}
            {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
));
TextInput.displayName = "TextInput";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export const TextareaInput = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className, ...props }, ref) => (
    <div>
        <label className="text-sm font-medium text-admin-fg mb-1.5 block">{label}</label>
        <textarea
            ref={ref}
            className={`${baseInputClass} min-h-30 resize-y ${error ? errorBorderClass : validBorderClass} ${className || ""}`}
            {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
));
TextareaInput.displayName = "TextareaInput";