"use client";

import { Button } from "@/components/ui/button";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, AppwriteException, Client, Models } from "appwrite";
import { Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type PageStatus = "initial_check" | "ready_to_confirm" | "confirming" | "error";

export default function ExportDevicePage() {
  const router = useRouter();

  const [status, setStatus] = useState<PageStatus>("initial_check");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );

  const account = useMemo(() => new Account(getAppwriteClient()), []);

  useEffect(() => {
    setStatus("initial_check");

    const checkSessionAndDeviceId = async () => {
      const searchParams = useSearchParams();
      const deviceId = searchParams.get("deviceId");
      setDeviceId(deviceId);
      if (!deviceId) {
        setErrorMessage(
          "Device ID is missing. This page cannot be opened directly.",
        );
        setStatus("error");
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!user) {
          throw new Error("No active session found.");
        }

        setStatus("ready_to_confirm");
      } catch (e) {
        console.error("No active session found:", e);
        toast.error("Authentication Required", {
          description: "Please log in to confirm the device.",
        });

        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = encodeURIComponent(currentPath);

        router.push(`/login?redirect=${redirectUrl}`);
        return;
      }
    };

    checkSessionAndDeviceId();
  }, [router, account]);

  const handleConfirmDevice = async () => {
    if (!deviceId) {
      toast.error("Device ID is missing.");
      return;
    }
    setStatus("confirming");
    setErrorMessage(null);

    try {
      const { jwt } = await account.createJWT();

      const res = await backendFetch(
        `/devices/${deviceId}/confirm`,
        "POST",
        jwt,
      );
      if (res.ok) {
        toast.success("Device Confirmed!", {
          description: "The device has been successfully registered.",
        });

        setTimeout(() => router.push("/dashboard/"), 1500);
      } else {
        const errorData = await res.json();
        const message = errorData.message || "Failed to confirm the device.";
        throw new Error(message);
      }
    } catch (e) {
      console.error("Device confirmation failed:", e);
      const appwriteError = e as AppwriteException;
      const message =
        appwriteError.message ||
        (e as Error).message ||
        "An unexpected error occurred.";
      setErrorMessage(message);
      setStatus("error");
      toast.error("Confirmation Failed", { description: message });
    }
  };

  if (status === "initial_check" || status === "error") return <div></div>;

  if (status === "ready_to_confirm" || status === "confirming") {
    return (
      <div className="mx-8 mt-8 flex flex-col items-center">
        <div className="bg-[#1A2841] w-25 h-25 rounded-full flex items-center justify-center shadow-sm">
          <Check className="size-13 text-slate-600" />
        </div>

        <div className="mt-4 text-center">
          <p className="text-2xl font-michroma">Device Registration</p>
          <p className="mt-4 text-sm">
            By clicking confirm, you will register the device to your team.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleConfirmDevice}
            className="cursor-pointer"
            disabled={status === "confirming"}
          >
            Confirm Device
          </Button>
        </div>
      </div>
    );
  }
}
