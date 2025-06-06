"use client";

import { Button } from "@/components/ui/button";
import { Account, Client, Models } from "appwrite";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function ExporrtDevicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("deviceId");
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
    const client = new Client().setEndpoint(endpoint).setProject(project);
    const account = new Account(client);

    (async () => {
      try {
        let user = await account.get();
        console.log("Hello " + JSON.stringify(user));
      } catch (err) {
        router.replace("/login");
      }
    })();
  }, []);

  async function confirmDevice() {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
    const client = new Client().setEndpoint(endpoint).setProject(project);
    const account = new Account(client);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

    const { jwt } = await account.createJWT();
    const url = `${apiBaseUrl}/devices/${deviceId}/confirm`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    window.close();
  }

  return (
    <div className="shadow-sm w-sm rounded-md p-5 mx-auto mt-12">
      <p className="text-lg font-semibold ">Device Registration</p>
      <p className="text-sm">
        By clicking confirm, you will register the device to your team.
      </p>
      <br />
      <Button className="w-full" onClick={confirmDevice}>
        Confirm
      </Button>
    </div>
  );
}
