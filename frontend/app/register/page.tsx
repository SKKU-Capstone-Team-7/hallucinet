"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, AppwriteException, Client, ID, Models } from "appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaApple, FaGithub, FaGoogle, FaMicrosoft } from "react-icons/fa";

export default function RegisterPage() {
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
  } = useForm<RegisterInputs>();

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (u) {
        router.push("/dashboard");
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

    // TODO: Error message
    if (data.password != data.confirm_password) {
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

      const registerRes = await backendFetch(
        "/users/me",
        "POST",
        jwt,
        JSON.stringify({}),
      );

      if (registerRes.ok) {
        router.push("/onboarding");
      } else {
        console.log(await registerRes.json());
      }
    } catch (e) {
      console.log(e);
    }
  };

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
            />
            <Input
              placeholder="Last Name"
              {...register("last_name", { required: true })}
            />
            <Input
              placeholder="Email"
              {...register("email", { required: true })}
            />
            <Input
              type="password"
              placeholder="Password"
              {...register("password", { required: true })}
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              {...register("confirm_password", { required: true })}
            />
          </div>

          <Button type="submit" className="w-full mt-4 bg-blue-900 py-4">
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
