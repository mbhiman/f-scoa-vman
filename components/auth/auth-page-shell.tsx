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
    secondaryLogoSrc?: string;
    secondaryLogoAlt?: string;
};

export default function AuthPageShell({
    variant,
    title,
    subtitle,
    portalLabel,
    children,
    secondaryLogoSrc,
    secondaryLogoAlt,
}: AuthPageShellProps) {
    return (
        <AuthLayout>
            <AuthHero variant={variant} />
            <AuthCard
                title={title}
                subtitle={subtitle}
                portalLabel={portalLabel}
                secondaryLogoSrc={secondaryLogoSrc}
                secondaryLogoAlt={secondaryLogoAlt}
            >
                {children}
            </AuthCard>
        </AuthLayout>
    );
}