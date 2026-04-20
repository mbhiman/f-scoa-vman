import type { ReactNode } from "react";
import LearnerNavbar from "@/components/learner/learner-navbar";
import LearnerFooter from "@/components/learner/learner-footer";

export default function LearnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LearnerNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <LearnerFooter />
    </div>
  );
}
