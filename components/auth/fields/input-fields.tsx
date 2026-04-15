"use client";

import React from "react";

type InputFieldProps = {
    label: string;
    error?: string;
    icon?: React.ReactNode;
    className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputField({
    label,
    error,
    icon,
    className = "",
    ...rest
}: InputFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">{label}</label>

            <div className="relative">
                {icon ? (
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                        {icon}
                    </span>
                ) : null}

                <input
                    {...rest}
                    className={`input-field ${icon ? "pl-11" : ""} ${error ? "border-red-500" : ""} ${className}`}
                />
            </div>

            {error ? <p className="text-xs text-red-500">{error}</p> : null}
        </div>
    );
}