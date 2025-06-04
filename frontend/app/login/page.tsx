"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { Account, Models } from "appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaApple, FaGithub, FaGoogle, FaMicrosoft } from "react-icons/fa";

type LoginInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInputs>();

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (u && u.emailVerification) {
        router.push("/dashboard");
      } else if (u && !u.emailVerification) {
        router.push("/verify-email");
      } else {
        setUser(u);
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    const client = getAppwriteClient();
    const account = new Account(client);

    try {
      await account.createEmailPasswordSession(data.email, data.password);
      router.push("/dashboard");
      return;
    } catch (e) {
      console.log(e);
    }
  };

  // 폼 데이터 감지해서 버튼 활성화 예시 (간단하게 email, password 값 체크)
  const email = watch("email");
  const password = watch("password");
  const isActive = email && password && email.length > 0 && password.length > 0;

  return (
    <div className="register-page flex justify-center items-center min-h-[100dvh] bg-[#050A12] p-8 box-border">
      {/* 로고 영역 (필요하면 여기에 추가) */}
      {/* <div className="logo-container fixed top-4 left-7">
        <img className="logo-img w-[200px]" src="/logo.png" alt="Logo" />
      </div> */}

      <div className="register-container w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] text-center">
        <h1 className="register-title text-2xl mb-2 font-normal">Welcome Back</h1>
        <p className="register-subtitle text-gray-500 mb-5 text-sm">Please enter your details</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5">
            <Input
              placeholder="Email"
              {...register("email", { required: true })}
              className="rounded-md border border-gray-300 p-2 text-sm"
            />
            <Input
              type="password"
              placeholder="Password"
              {...register("password", { required: true })}
              className="rounded-md border border-gray-300 p-2 text-sm"
            />

            <div className="flex mt-1 justify-between items-center">
              <div className="flex items-center">
                <Checkbox id="terms" />
                <label htmlFor="terms" className="text-xs pl-2 select-none">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-xs text-blue-500 py-2 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isActive}
            className={`w-full mt-4 py-3 font-semibold transition-all duration-200 ${
              isActive
                ? "bg-[#1f8CF0] cursor-pointer hover:translate-y-[-2px]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Login
          </Button>
        </form>

        <div className="oauth-container mt-6 flex justify-center gap-4">
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

        <div className="register-footer mt-6 text-center text-xs">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
