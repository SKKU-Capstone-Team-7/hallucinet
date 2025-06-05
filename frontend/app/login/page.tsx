"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { Account, AppwriteException } from "appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaApple, FaGithub, FaGoogle, FaMicrosoft } from "react-icons/fa";
import { toast } from "sonner";

type LoginInputs = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

type PageStatus =
  | "initial_check"
  | "ready_to_login"
  | "submitting_login"
  | "login_redirecting";

export default function LoginPage() {
  const [pageStatus, setPageStatus] = useState<PageStatus>("initial_check");
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>();

  const account = useMemo(() => new Account(getAppwriteClient()), []);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const user = await getCurrentUser();

        if (user) {
          if (user.emailVerification) {
            toast.info("Already logged in", {
              description: "Redirecting to your dashboard...",
            });
            router.push("/dashboard");
            return;
          } else {
            toast.info("Email not verified", {
              description: "Please check your email to verify your account.",
            });
            router.push("/verify-email");
            return;
          }
        } else {
          setPageStatus("ready_to_login");
        }
      } catch (e) {
        console.error("Error checking user session:", e);
        setPageStatus("ready_to_login");
      }
    };

    checkUserSession();
  }, [router, account]);

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    setLoginError(null);

    try {
      await account.createEmailPasswordSession(data.email, data.password);
      setPageStatus("login_redirecting");
      toast.success("Login Successful!", {
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } catch (e) {
      console.error("Login failed:", e);
      const appwriteError = e as AppwriteException;
      const errorMessage = appwriteError.message || "Invalid email or password";
      setLoginError(errorMessage);
      toast.error("Login Failed", { description: errorMessage });
    }
  };

  if (pageStatus === "initial_check" || pageStatus === "login_redirecting") {
    return <div></div>;
  }

  return (
    <div className="w-sm mx-auto mt-20 bg-white shadow-sm p-8">
      <p className="text-2xl font-light text-center text-black mt-4">
        Welcome Back
      </p>
      <p className="text-sm text-center text-gray-500">
        Please enter your details
      </p>

      <div className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5">
            <Input
              id="email-login"
              placeholder="Email"
              className="text-black"
              {...register("email", {
                required: true,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address.",
                },
              })}
              disabled={isSubmitting}
            />
            <Input
              id="password-login"
              type="password"
              placeholder="Password"
              className="text-black"
              {...register("password", { required: true })}
              disabled={isSubmitting}
            />

            <div className="flex mt-1 justify-center items-center gap-4 text-black">
              <div className="flex items-center">
                <Checkbox
                  id="terms"
                  {...register("rememberMe")}
                  disabled={isSubmitting}
                />
                <label htmlFor="terms" className="text-xs pl-2 text-black">
                  Remember me
                </label>
              </div>
              <Link
                className="text-xs text-blue-500 py-2"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-blue-900 py-4"
            disabled={isSubmitting}
          >
            Login
          </Button>

          <div className="mt-4 flex gap-4 mx-auto justify-center">
            <div className="p-2 bg-gray-100 rounded-xl w-16">
              <FaApple className="mx-auto text-black" size={22} />
            </div>
            <div className="p-2 bg-gray-100 rounded-xl w-16">
              <FaGithub className="mx-auto text-black" size={22} />
            </div>
            <div className="p-2 bg-gray-100 rounded-xl w-16">
              <FaGoogle className="mx-auto text-black" size={22} />
            </div>
            <div className="p-2 bg-gray-100 rounded-xl w-16">
              <FaMicrosoft className="mx-auto text-black" size={22} />
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-black">
            <p>
              Don't have an account?{" "}
              <Link className="text-blue-500" href="/register">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
