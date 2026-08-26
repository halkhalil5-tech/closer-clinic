"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const DEV_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (DEV_MODE) {
    return (
      <div className="flex flex-col gap-3">
        <div className="border border-amber/50 bg-amber/10 p-3 text-[13px] text-amber">
          Dev mode — Supabase isn&apos;t configured, so there&apos;s no real sign-in. You&apos;ll
          practice as a local dev user.
        </div>
        <button
          onClick={() => router.push("/home")}
          className="display h-12 bg-primary text-[14px] tracking-wide text-white"
        >
          Continue in dev mode
        </button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setNotice("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  const inputCls =
    "h-11 border border-line bg-panel px-3 text-[14px] text-ink placeholder:text-faint focus:border-primary focus:outline-none";

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      {mode === "signup" && (
        <input
          className={inputCls}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      )}
      <input
        className={inputCls}
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <input
        className={inputCls}
        type="password"
        required
        minLength={8}
        placeholder="Password (8+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
      />

      {error && (
        <div className="border border-red/50 bg-red/10 p-2.5 text-[13px] text-red">{error}</div>
      )}
      {notice && (
        <div className="border border-primary/50 bg-primary/10 p-2.5 text-[13px] text-primary">{notice}</div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="display h-12 bg-primary text-[14px] tracking-wide text-white disabled:opacity-50"
      >
        {busy ? "One sec" : mode === "signup" ? "Create account" : "Sign in"}
      </button>

      <div className="my-0.5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="microlabel">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={busy}
        className="h-12 border border-line bg-panel text-[14px] font-medium text-ink disabled:opacity-50"
      >
        Continue with Google
      </button>

      <p className="mt-2 text-center text-[13px] text-muted">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-primary">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
