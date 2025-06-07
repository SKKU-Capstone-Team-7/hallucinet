"use client";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { Account } from "appwrite";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();

      try {
        if (u) {
          const account = new Account(getAppwriteClient());
          await account.deleteSession("current");
        }
        router.push("/login");
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  return <></>;
}
