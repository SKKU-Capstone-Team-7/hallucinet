"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Client, Account, Models } from 'appwrite';
import { toast } from "sonner";
import { getAppwriteClient, getCurrentUser } from '@/lib/appwrite';
import MainLayout from '@/components/MainLayout';
import { Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
      null,
    );
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const client = getAppwriteClient();
  const account = new Account(client);

  useEffect(() => {  

    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (userId && secret) {
      setLoading(true);
    
      setIsSuccess(null);

      account.updateVerification(userId, secret)
        .then(() => {
          setIsSuccess(true);
          toast.success("Email verified successfully!");
          router.push('/login'); 
          return;
        })
        .catch((error) => {
          console.error("Email verification failed:", error);
          //setMessage(`Verification failed: ${error.message}. Please try again or request a new verification link.`);
          setIsSuccess(false);
        })
        .finally(() => {
          setLoading(false);
        })
    } else {
      (async () => {
        setLoading(true);
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);

          if (currentUser) {
            if (currentUser.emailVerification) {
              toast.info("Your email is already verified. Redirecting to dashboard...");
              router.push("/dashboard");
              return;
            } else {
            setIsSuccess(false); 
            setLoading(false);
            }
          } else {
            // not login not userId not secret case
            setIsSuccess(false);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching current user:", error);
          setIsSuccess(false);
          setUser(null);
          setLoading(false);
        }
      })();
    }
  }, [searchParams, router]);

  if (loading) return <></>;

  return (
    <MainLayout user={user!} menuDisabled={true}>
      <div className="mx-8 mt-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-sm">
          <Mail className="size-13"></Mail>
        </div>
            <div className="mt-4">
              <p className="text-3xl text-center">Verify your email address</p>
              <p className="mt-4 text-center">We have sent a verification link</p>
              <p className="mt-4 text-center">Click on the link to complete the verification process.</p>
              <p className="text-center">You might need to check your spam folder.</p>
            </div>
      </div>
      <div className="mx-8 mt-8 flex justify-center gap-4">
      <Button className="w-30" onClick={async () => {
        const verificationUrl = `${window.location.origin}/verify-email`;
        try {
        await account.createVerification(verificationUrl);
        toast.info("Verification email resent.", {
        description: "Please check your email inbox.",
        });
        } catch (error: any) {
          console.error();
        }
      }}>Resend email</Button>
      </div>
    </MainLayout>
  );
}