import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function backendFetch(
  relativeUrl: string,
  method: string,
  jwt: string,
  body?: any,
) {
  const backendEndpoint = process.env.NEXT_PUBLIC_API_BASE_URL;

  const res = await fetch(backendEndpoint + relativeUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    method: method,
    body: body,
  });

  return res;
}
