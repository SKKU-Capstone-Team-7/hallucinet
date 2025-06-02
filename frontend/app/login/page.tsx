"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { Account, AppwriteException, Client, Models } from "appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaApple, FaGithub, FaGoogle, FaMicrosoft } from "react-icons/fa";

export default function LoginPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
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
        setUser(await getCurrentUser());
        setLoading(false);
      }
    })();
  }, []);

  type LoginInputs = {
    email: string;
    password: string;
  };
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

  return (
    <div className="w-sm mx-auto mt-20 bg-white shadow-sm p-8">
      <p className="text-2xl font-light text-center mt-4">Welcome Back</p>
      <p className="text-sm text-center text-gray-500">
        Please enter your details
      </p>

      <div className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5">
            <Input
              placeholder="Email"
              {...register("email", { required: true })}
            />
            <Input
              type="password"
              placeholder="Password"
              {...register("password", { required: true })}
            />

            <div className="flex mt-1 justify-between items-center">
              <div className="flex">
                <Checkbox id="terms" />
                <label htmlFor="terms" className="text-xs pl-2">
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

          <Button type="submit" className="w-full mt-4 bg-blue-900 py-4">
            Login
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
            Don't have an account?{" "}
            <Link className="text-blue-500" href="/register">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
