import { Info } from "lucide-react";

interface StatusBannerProps {
    error: string;
    success: string;
}

export function StatusBanner({ error, success }: StatusBannerProps) {
    if (!error && !success) return null;
    return (
        <div className={`mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${error ? "border-red-500/30 bg-red-500/10 text-red-500" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"}`}>
            <Info className="w-5 h-5 shrink-0" />
            <p>{error || success}</p>
        </div>
    );
}