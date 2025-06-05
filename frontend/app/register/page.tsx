"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, AppwriteException, Client, ID, Models } from "appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaApple, FaGithub, FaGoogle, FaMicrosoft } from "react-icons/fa";
import { toast } from "sonner";

type RegisterInputs = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
};

type PageStatus =
  | 'initial_check'      
  | 'ready_to_register'     
  | 'registration_redirecting'; 

export default function RegisterPage() {
  const [pageStatus, setPageStatus] = useState<PageStatus>('initial_check');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInputs>();

  const account = useMemo(() => new Account(getAppwriteClient()),[]);

  useEffect(() => {
    setPageStatus('initial_check');

    const checkUserSession = async () => {
      try {
        const user = await getCurrentUser();

        if (user) {
          if (user.emailVerification) {
            toast.info("Already logged in and verified.", { description: "Redirecting to dashboard..." });
            router.push("/dashboard");
          } else {
            toast.info("Email not verified.", { description: "Please check your email or resend verification." });
            router.push("/verify-email");
          }
        } else {
          setPageStatus('ready_to_register');
        }
      } catch (e) {
        console.error("Error checking user session:", e);
        setPageStatus('ready_to_register');
      }
    };

    checkUserSession();
  }, [router, account]);

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    setRegisterError(null);

    if (data.password !== data.confirm_password) {
      const errMsg = "Passwords do not match.";
      setRegisterError(errMsg);
      toast.error("Registration Failed", { description: errMsg });
      return;
    }

    try {
      await account.create(
        ID.unique(),
        data.email,
        data.password,
        `${data.first_name} ${data.last_name}`,
      );

      await account.createEmailPasswordSession(data.email, data.password);
      const { jwt } = await account.createJWT();

      const verificationUrl = `${window.location.origin}/verify-email`
      await account.createVerification(verificationUrl);

      const registerRes = await backendFetch(
        "/users/me",
        "POST",
        jwt,
        JSON.stringify({}),
      );
      if (!registerRes.ok) {
        const errorData = await registerRes.json();
        throw new AppwriteException(errorData.message || "Failed to sync user with backend.");
      }

      setPageStatus('registration_redirecting');
      toast.success("Registration Successful!", {
        description: "A verification email has been sent. Please check your inbox.",
      });
      router.push("/verify-email");
    } catch (e) {
      console.error("Registration failed:", e);
      const appwriteError = e as AppwriteException;
      const errorMessage = appwriteError.message || "An error occurred during registration. Please try again.";
      setRegisterError(errorMessage);
      toast.error("Registration Failed", { description: errorMessage });
    }
  };

  if (pageStatus === 'initial_check' || pageStatus === 'registration_redirecting') {
    return (
      <div></div>
    );
  }

  return (
    <div className="w-sm mx-auto mt-20 bg-white shadow-sm p-8">
      <p className="text-2xl font-light text-center mt-4">Create an Account</p>
      <p className="text-sm text-center text-gray-500">
        Please enter your details
      </p>

      <div className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5">
            <Input
              placeholder="First Name"
              {...register("first_name", { required: true })}
              disabled={isSubmitting}
            />
            <Input
              placeholder="Last Name"
              {...register("last_name", { required: true })}
              disabled={isSubmitting}
            />
            <Input
              placeholder="Email"
              {...register("email", { 
                required: true,
              })}
              disabled={isSubmitting}
            />
            <Input
              type="password"
              placeholder="Password"
              {...register("password", { 
                required: true,
                minLength: { 
                  value: 8, 
                  message: "Password must be at least 8 characters."
                } 
              })}
              disabled={isSubmitting}
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              {...register("confirm_password", { 
                required: true,
                validate: (value) => value === watch("password") || "Passwords do not match." 
              })}
              disabled={isSubmitting}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full mt-4 bg-blue-900 py-4"
            disabled={isSubmitting}
          >
            Sign up
          </Button>

          <div className="mt-4 flex gap-4 mx-auto">
            <div className="p-2 bg-gray-100 rounded-xl w-16">
              <FaApple className="mx-auto" size={22} />
            </div>
            <div className="p-2 bg-gray-100 rounded-xl w-16">
              <FaGithub className="mx-auto" size={22} />
            </div>
            <div className="p-2 bg-gray-100 rounded-xl w-16">
              <FaGoogle className="mx-auto" size={22} />
            </div>
            <div className="p-2 bg-gray-100 rounded-xl w-16">
              <FaMicrosoft className="mx-auto" size={22} />
            </div>
          </div>

          <div className="mt-4 text-center text-xs">
            Already have an account?{" "}
            <Link className="text-blue-500" href="/login">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
