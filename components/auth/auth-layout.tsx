"use client";

type AuthLayoutProps = {
    children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen">
                <div className="mx-auto flex min-h-screen w-full max-w-7xl items-start px-4 py-6 sm:px-6 lg:items-center lg:px-8">
                    <div className="grid w-full items-center gap-10 lg:grid-cols-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}