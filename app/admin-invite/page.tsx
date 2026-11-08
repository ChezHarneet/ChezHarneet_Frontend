"use client";

import { apiFetch } from "../../lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminInvitePage() {
  const [message, setMessage] = useState("Verifying your invitation…");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const code = new URLSearchParams(window.location.search).get("token");
      if (!code) {
        setMessage("This invitation link is missing its code.");
        return;
      }
      window.history.replaceState({}, "", window.location.pathname);
      try {
        const response = await apiFetch("/auth/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "This invitation is invalid or has expired.");
        if (cancelled) return;
        setEmail(payload.email);
        setAccepted(true);
        setMessage("Your administrator invitation is accepted.");
      } catch (cause) {
        if (!cancelled) {
          setMessage(cause instanceof Error ? cause.message : "Could not accept this invitation.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="auth-callback">
      <section className="admin-invite-result">
        <h1>{accepted ? "Welcome to the Content Studio" : "Administrator invitation"}</h1>
        <p>{message}</p>
        {email && <p>{email}</p>}
        {accepted && <Link className="admin-invite-continue" href={`/admin?email=${encodeURIComponent(email)}`}>
          Continue to sign in
        </Link>}
      </section>
    </main>
  );
}
