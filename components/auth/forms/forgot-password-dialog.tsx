"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import InputField from "@/components/auth/fields/input-fields";
import { slideUp, buttonHover, buttonTap } from "@/lib/animation/animations";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type Props = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  initialMobile?: string;
};

const mobileSchema = z.object({
  mobile: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 15, { message: "Enter a valid mobile number" }),
});

const otpSchema = z.object({
  otp: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 6, { message: "OTP must be 6 digits" }),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Minimum 8 characters")
      .refine((v) => /[A-Z]/.test(v), { message: "Must include an uppercase letter" })
      .refine((v) => /[a-z]/.test(v), { message: "Must include a lowercase letter" })
      .refine((v) => /\d/.test(v), { message: "Must include a number" })
      .refine((v) => /[@$!%*?&#]/.test(v), { message: "Must include a special character (@$!%*?&#)" }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type MobileType = z.infer<typeof mobileSchema>;
type OtpType = z.infer<typeof otpSchema>;
type PasswordType = z.infer<typeof passwordSchema>;

function safeMessage(json: any, fallback: string) {
  return typeof json?.message === "string" && json.message.trim() ? json.message : fallback;
}

export default function ForgotPasswordDialog({ open, onOpenChange, initialMobile }: Props) {
  const [step, setStep] = React.useState<"mobile" | "otp" | "reset" | "done">("mobile");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [resetToken, setResetToken] = React.useState<string | null>(null);

  const mobileForm = useForm<MobileType>({
    resolver: zodResolver(mobileSchema),
    mode: "onChange",
    defaultValues: { mobile: "" },
  });

  const otpForm = useForm<OtpType>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: "" },
  });

  const resetForm = useForm<PasswordType>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  React.useEffect(() => {
    if (!open) return;

    const cleaned = (initialMobile ?? "").replace(/\D/g, "");
    if (cleaned) {
      mobileForm.setValue("mobile", cleaned, { shouldValidate: true });
    }

    setStep("mobile");
    setLoading(false);
    setMessage("");
    setResetToken(null);
  }, [open, initialMobile, mobileForm]);

  const close = () => onOpenChange(false);

  const submitMobile = async (data: MobileType) => {
    if (!BASE_URL) {
      setMessage("Backend URL is not configured.");
      return;
    }

    setLoading(true);
    setMessage("");
    const cleanedMobile = data.mobile.replace(/\D/g, "");

    try {
      const res = await fetch(`${BASE_URL}/student/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: cleanedMobile }),
      });

      const json = await res.json().catch(() => null);
      setMessage(
        safeMessage(
          json,
          "If this number is registered, an OTP will be sent to the associated email."
        )
      );
      setMobile(cleanedMobile);
      setStep("otp");
    } catch (e) {
      console.error(e);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (data: OtpType) => {
    if (!BASE_URL) {
      setMessage("Backend URL is not configured.");
      return;
    }

    setLoading(true);
    setMessage("");
    const cleanedOtp = data.otp.replace(/\D/g, "");

    try {
      const res = await fetch(`${BASE_URL}/student/auth/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: cleanedOtp }),
      });
      const json = await res.json().catch(() => null);

      if (!json?.success) {
        setMessage(safeMessage(json, "OTP verification failed"));
        return;
      }

      const token = json?.data?.resetToken;
      if (typeof token !== "string" || !token) {
        setMessage("Reset token not received from server.");
        return;
      }

      setResetToken(token);
      setMessage(safeMessage(json, "OTP verified. Use the reset token to set a new password."));
      setStep("reset");
    } catch (e) {
      console.error(e);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (data: PasswordType) => {
    if (!BASE_URL) {
      setMessage("Backend URL is not configured.");
      return;
    }
    if (!resetToken) {
      setMessage("Reset token is missing. Please verify OTP again.");
      setStep("otp");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/student/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!json?.success) {
        setMessage(safeMessage(json, "Password reset failed"));
        return;
      }

      setMessage(safeMessage(json, "Password reset successfully."));
      setStep("done");
      resetForm.reset();
      otpForm.reset();
    } catch (e) {
      console.error(e);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close forgot password dialog"
        className="absolute inset-0 bg-black/40"
        onClick={close}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Forgot password</h3>
            <p className="text-sm text-muted">Reset via OTP to your registered channels.</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-md px-2 py-1 text-sm font-medium text-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {message ? (
          <motion.div variants={slideUp} initial="hidden" animate="visible" className="mb-4">
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted">
              {message}
            </div>
          </motion.div>
        ) : null}

        {step === "mobile" ? (
          <form onSubmit={mobileForm.handleSubmit(submitMobile)} className="flex flex-col gap-4">
            <InputField
              label="Mobile Number"
              placeholder="Enter your mobile number"
              type="tel"
              inputMode="numeric"
              maxLength={15}
              error={mobileForm.formState.errors.mobile?.message}
              {...mobileForm.register("mobile")}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                mobileForm.setValue("mobile", val, { shouldValidate: true });
              }}
            />

            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </motion.button>
          </form>
        ) : null}

        {step === "otp" ? (
          <form onSubmit={otpForm.handleSubmit(submitOtp)} className="flex flex-col gap-4">
            <InputField label="Mobile Number" value={mobile} disabled readOnly />

            <InputField
              label="OTP"
              placeholder="Enter 6-digit OTP"
              inputMode="numeric"
              maxLength={6}
              error={otpForm.formState.errors.otp?.message}
              {...otpForm.register("otp")}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                otpForm.setValue("otp", val, { shouldValidate: true });
              }}
              className="text-center tracking-[0.3em]"
            />

            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </motion.button>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setStep("mobile");
              }}
              className="w-full text-sm font-medium text-muted hover:text-foreground"
            >
              ← Back
            </button>
          </form>
        ) : null}

        {step === "reset" ? (
          <form onSubmit={resetForm.handleSubmit(submitReset)} className="flex flex-col gap-4">
            <InputField
              label="New Password"
              type="password"
              placeholder="Enter new password"
              error={resetForm.formState.errors.newPassword?.message}
              {...resetForm.register("newPassword")}
            />

            <InputField
              label="Confirm Password"
              type="password"
              placeholder="Re-enter new password"
              error={resetForm.formState.errors.confirmPassword?.message}
              {...resetForm.register("confirmPassword")}
            />

            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </motion.button>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setStep("otp");
              }}
              className="w-full text-sm font-medium text-muted hover:text-foreground"
            >
              ← Back
            </button>
          </form>
        ) : null}

        {step === "done" ? (
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              type="button"
              onClick={close}
              className="btn btn-primary w-full py-3 text-base"
            >
              Back to sign in
            </motion.button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

