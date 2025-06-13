import { Suspense } from "react";
import VerifyEmailClient from "./client";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailClient />
    </Suspense>
  );
}
