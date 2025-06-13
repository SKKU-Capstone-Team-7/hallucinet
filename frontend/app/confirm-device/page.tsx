import { Suspense } from "react";
import ExportDeviceClient from "./client";

export default function ExportDevicePage() {
  return (
    <Suspense>
      <ExportDeviceClient />
    </Suspense>
  );
}
