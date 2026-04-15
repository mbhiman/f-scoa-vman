"use client";

import AuthLayout from "@/components/auth/auth-layout";
import AuthHero from "@/components/auth/auth-hero";
import AuthCard from "@/components/auth/auth-card";

type AuthPageShellProps = {
    variant: "regular" | "ncvet";
    title: string;
    subtitle: string;
    portalLabel: string;
    children: React.ReactNode;
};

export default function AuthPageShell({
    variant,
    title,
    subtitle,
    portalLabel,
    children,
}: AuthPageShellProps) {
    return (
        <AuthLayout>
            <AuthHero variant={variant} />
            <AuthCard title={title} subtitle={subtitle} portalLabel={portalLabel}>
                {children}
            </AuthCard>
        </AuthLayout>
    );
}