"use client";
import { getCurrentUser } from "@/lib/appwrite";
import { Models } from "appwrite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setUser(await getCurrentUser());
      setLoading(false);

      if (!loading && !user) {
        router.push("/login");
      }
    })();
  }, []);

  if (loading) return <></>;

  return (
    <>
      <p>Hello, {user?.name}</p>
    </>
  );
}
