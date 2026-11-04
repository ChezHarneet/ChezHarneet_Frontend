"use client";

import { apiFetch } from "../../../lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing sign in…");

  useEffect(() => {
    void (async () => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("access_token");
      if (!token) {
        setMessage("The sign-in response did not include an access token.");
        return;
      }
      try {
        const response = await apiFetch(`/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const profile = await response.json();
        if (!response.ok) throw new Error(profile.message ?? "Could not load your account");
        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
        const values: Record<string, string> = {
          "learner-access-token": token,
          "learner-account-email": profile.email,
          "learner-account-name": fullName,
          "learner-account-role": profile.role,
          "learner-first-name": profile.firstName ?? "",
          "learner-last-name": profile.lastName ?? "",
          "learner-phone": profile.phone ?? "",
        };
        for (const [key, value] of Object.entries(values)) window.sessionStorage.setItem(key, value);
        if (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") {
          window.sessionStorage.setItem("cms-access-token", token);
          window.sessionStorage.setItem("cms-account-email", profile.email);
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      } catch (cause) {
        setMessage(cause instanceof Error ? cause.message : "Sign in could not be completed.");
      }
    })();
  }, [router]);

  return <main className="auth-callback"><p>{message}</p></main>;
}
