"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    staggerContainer,
    slideUp,
    scaleIn,
    floatAnimation,
    floatAnimationDelayed,
    floatAnimationSlow,
} from "@/lib/animation/animations";

type AuthHeroProps = {
    variant: "regular" | "ncvet";
};

const heroContent = {
    regular: {
        badge: "Free Certification Program",
        titleBefore: "Build Your Career in",
        titleHighlight: "Supply Chain",
        description:
            "6 days classroom training plus 45 days paid on-the-job training with one of India’s leading e-commerce companies.",
        stats: [
            { value: "90,000+", label: "Trained Students" },
            { value: "51", label: "Cities Covered" },
            { value: "Free", label: "Certification" },
        ],
    },
    ncvet: {
        badge: "NCVET Candidate Portal",
        titleBefore: "Start Your Verified",
        titleHighlight: "Learning Journey",
        description:
            "Access your structured certification journey, learner verification flow, and training support through the NCVET pathway.",
        stats: [
            { value: "Verified", label: "Candidate Flow" },
            { value: "Secure", label: "OTP Access" },
            { value: "Guided", label: "Enrollment Process" },
        ],
    },
} as const;

export default function AuthHero({ variant }: AuthHeroProps) {
    const content = heroContent[variant];

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex flex-col gap-0 relative"
        >
            <motion.div variants={slideUp} className="mb-8">
                <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    {content.badge}
                </span>

                <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground xl:text-5xl">
                    {content.titleBefore}{" "}
                    <span className="text-primary">{content.titleHighlight}</span>
                </h1>

                <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
                    {content.description}
                </p>
            </motion.div>

            <div className="relative h-85 lg:h-105">
                <motion.div
                    variants={scaleIn}
                    animate={floatAnimation}
                    className="absolute left-0 top-0 w-[55%] overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
                >
                    <Image
                        src="/images/hero-1.jpg"
                        width={400}
                        height={280}
                        alt="Learners in training"
                        className="h-65 w-full object-cover"
                    />
                </motion.div>

                <motion.div
                    variants={scaleIn}
                    animate={floatAnimationDelayed}
                    className="absolute right-0 top-4 w-[42%] overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
                >
                    <Image
                        src="/images/hero-4.jpg"
                        width={300}
                        height={200}
                        alt="Program visual"
                        className="h-47 w-full object-cover"
                    />
                </motion.div>

                <motion.div
                    variants={scaleIn}
                    animate={floatAnimationSlow}
                    className="absolute bottom-0 right-4 w-[52%] overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
                >
                    <Image
                        src="/images/hero-3.jpg"
                        width={350}
                        height={220}
                        alt="Students learning"
                        className="h-53 w-full object-cover"
                    />
                </motion.div>

                <motion.div
                    variants={scaleIn}
                    animate={{
                        y: [0, -6, 0],
                        transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 },
                    }}
                    className="absolute bottom-2 left-8 w-[36%] overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
                >
                    <Image
                        src="/images/hero-2.jpg"
                        width={240}
                        height={160}
                        alt="Learning experience"
                        className="h-37 w-full object-cover"
                    />
                </motion.div>
            </div>

            <motion.div variants={slideUp} className="mt-6 flex items-center gap-6">
                {content.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col">
                        <span className="text-2xl font-bold text-primary">{stat.value}</span>
                        <span className="text-xs text-muted">{stat.label}</span>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}