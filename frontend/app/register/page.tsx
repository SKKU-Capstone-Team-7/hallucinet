"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, ID, Models } from "appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaApple, FaGithub, FaGoogle, FaMicrosoft } from "react-icons/fa";
import { toast } from "sonner";

export default function RegisterPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInputs>();

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (u && u.emailVerification) {
        router.push("/dashboard");
      } else if (u && !u.emailVerification) {
        router.push("/verify-email");
      } else {
        setUser(await getCurrentUser());
        setLoading(false);
      }
    })();
  }, []);

  type RegisterInputs = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
  };

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    const client = getAppwriteClient();
    const account = new Account(client);

    if (data.password !== data.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await account.create(
        ID.unique(),
        data.email,
        data.password,
        `${data.first_name} ${data.last_name}`
      );

      await account.createEmailPasswordSession(data.email, data.password);
      const { jwt } = await account.createJWT();

      const verificationUrl = `${window.location.origin}/verify-email`;
      await account.createVerification(verificationUrl);

      const registerRes = await backendFetch("/users/me", "POST", jwt, JSON.stringify({}));

      if (registerRes.ok) {
        toast.info("Verification email sent.", {
          description: "Please check your email inbox.",
        });
        router.push("/verify-email");
      } else {
        console.error(await registerRes.json());
      }
    } catch (e) {
      console.error(e);
      toast.error("Registration failed.");
    }
  };

  const passwordsMatch =
    watch("password") && watch("confirm_password") && watch("password") === watch("confirm_password");

  return (
    <div className="flex justify-center items-center min-h-[100dvh] bg-[#050A12] p-8 box-border relative overflow-hidden">
      {/* 로고 */}
      <div className="fixed top-4 left-7">
        <img src="/logo.png" alt="Logo" className="w-48" />
      </div>

      {/* 등록 컨테이너 */}
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg text-center">
        <p className="text-2xl font-light mt-4 mb-1">Create an Account</p>
        <p className="text-sm text-gray-500 mb-5">Please enter your details</p>

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div className="grid gap-5">
            <Input
              placeholder="First Name"
              {...register("first_name", { required: true })}
              className="rounded-lg border border-gray-300 text-sm p-2.5"
            />
            <Input
              placeholder="Last Name"
              {...register("last_name", { required: true })}
              className="rounded-lg border border-gray-300 text-sm p-2.5"
            />
            <Input
              placeholder="Email"
              {...register("email", { required: true })}
              className="rounded-lg border border-gray-300 text-sm p-2.5"
            />

            <div className="relative pass-input-div">
              <Input
                type="password"
                placeholder="Password"
                {...register("password", { required: true })}
                className="rounded-lg border border-gray-300 text-sm p-2.5 pr-10"
              />
              {/* 비밀번호 토글 아이콘 자리 (필요하면 추가) */}
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                width={20}
                height={20}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m0 0l3-3m-3 3l3 3" />
              </svg>
            </div>

            <div className="relative pass-input-div">
              <Input
                type="password"
                placeholder="Confirm Password"
                {...register("confirm_password", { required: true })}
                className="rounded-lg border border-gray-300 text-sm p-2.5 pr-10"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                width={20}
                height={20}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m0 0l3-3m-3 3l3 3" />
              </svg>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!passwordsMatch}
            className={`w-full mt-4 py-3 rounded-lg text-white font-semibold transition duration-200 ease-in-out ${
              passwordsMatch ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Sign up
          </Button>
        </form>

        {/* OAuth 버튼들 */}
        <div className="mt-6 flex justify-center gap-4">
          <div className="p-2 bg-gray-100 rounded-xl w-16 cursor-pointer">
            <FaApple className="mx-auto" size={22} />
          </div>
          <div className="p-2 bg-gray-100 rounded-xl w-16 cursor-pointer">
            <FaGithub className="mx-auto" size={22} />
          </div>
          <div className="p-2 bg-gray-100 rounded-xl w-16 cursor-pointer">
            <FaGoogle className="mx-auto" size={22} />
          </div>
          <div className="p-2 bg-gray-100 rounded-xl w-16 cursor-pointer">
            <FaMicrosoft className="mx-auto" size={22} />
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
