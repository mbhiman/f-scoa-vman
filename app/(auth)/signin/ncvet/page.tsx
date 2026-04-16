import AuthPageShell from "@/components/auth/auth-page-shell";
import NcvetLoginForm from "@/components/auth/forms/ncvet-login-form";

export default function NcvetSignInPage() {
    return (
        <AuthPageShell
            variant="ncvet"
            title="Welcome back"
            subtitle="Sign in to your NCVET learner portal"
            portalLabel="NCVET Student Portal"
            secondaryLogoSrc="/images/ncvet-logo.png"
            secondaryLogoAlt="NCVET logo"
        >
            <NcvetLoginForm />
        </AuthPageShell>
    );
}