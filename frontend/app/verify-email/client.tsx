"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Account, Models, AppwriteException } from "appwrite";
import { toast } from "sonner";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import MainLayout from "@/components/MainLayout";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageStatus =
  | "initial_loading"
  | "verifying_from_link"
  | "link_verification_success"
  | "link_verification_failed"
  | "prompt_to_verify";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pageStatus, setPageStatus] = useState<PageStatus>("initial_loading");
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const account = useMemo(() => new Account(getAppwriteClient()), []);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    const attemptVerificationFromLink = async (uid: string, sec: string) => {
      setPageStatus("verifying_from_link");
      setErrorMessage(null);

      try {
        await account.updateVerification(uid, sec);
        setPageStatus("link_verification_success");
        toast.success("Email Verified Successfully!", {
          description: "Redirecting to login page...",
        });
        router.push("/login");
      } catch (e) {
        console.error("Email verification from link failed:", e);
        const message =
          (e as AppwriteException).message ||
          "Invalid or expired verification link. Please try resending the email or contact support.";
        setErrorMessage(message);
        setPageStatus("link_verification_failed");
        toast.error("Verification Failed", {
          description: message,
        });
      }
    };

    const checkCurrentUserState = async () => {
      try {
        const user = await getCurrentUser();
        setUser(user);

        if (user) {
          if (user.emailVerification) {
            toast.info("Your email is already verified.", {
              description: "Redirecting to your dashboard...",
            });
            router.push("/dashboard");
          } else {
            setPageStatus("prompt_to_verify");
          }
        } else {
          setPageStatus("prompt_to_verify");
        }
      } catch (e) {
        console.warn(
          "Could not fetch current user status (or no active session):",
          e,
        );
        setUser(null);
        setPageStatus("prompt_to_verify");
      }
    };

    if (userId && secret) {
      attemptVerificationFromLink(userId, secret);
    } else {
      checkCurrentUserState();
    }
  }, [router, account]);

  const handleResendVerificationEmail = async () => {
    setIsResending(true);
    setErrorMessage(null);
    const verificationUrl = `${window.location.origin}/verify-email`;

    try {
      await account.createVerification(verificationUrl);
      toast.success("Verification Email Sent", {
        description:
          "Please check your email inbox (and spam folder). If you don't see it, try again in a few minutes.",
      });
    } catch (e) {
      console.error("Failed to resend verification email:", e);
      const message =
        (e as AppwriteException).message ||
        "Could not send verification email. Please ensure you have an account or try registering again.";
      setErrorMessage(message);
      toast.error("Failed to Resend Email", { description: message });
    } finally {
      setIsResending(false);
    }
  };

  if (
    pageStatus === "initial_loading" ||
    pageStatus === "verifying_from_link" ||
    pageStatus === "link_verification_success"
  ) {
    return <div></div>;
  }

  const VerificationPromptUI = (
    <div className="mx-8 mt-8 flex flex-col items-center">
      <div className="bg-[#1A2841] w-25 h-25 rounded-full flex items-center justify-center shadow-sm">
        <Mail className="size-13 text-slate-600" />
      </div>

      <div className="mt-4 text-center">
        <p className="text-2xl font-michroma">
          {pageStatus === "link_verification_failed"
            ? "Email Verification Failed"
            : "Verify Your Email Address"}
        </p>

        <p className="mt-4 text-sm">
          {user && !user.emailVerification && pageStatus === "prompt_to_verify"
            ? `We have sent a verification link to ${user.email}.`
            : `We have sent a verification link.`}
        </p>
        <p className="mt-1 text-sm">Click the link to complete the process.</p>
        <p className="text-sm">You might need to check your spam folder.</p>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleResendVerificationEmail}
          className="cursor-pointer"
          disabled={isResending}
        >
          Resend Email
        </Button>
      </div>
    </div>
  );

  if (user && pageStatus === "prompt_to_verify") {
    return (
      <MainLayout user={user} menuDisabled={true}>
        {VerificationPromptUI}
      </MainLayout>
    );
  }

  return <div>{VerificationPromptUI}</div>;
}
