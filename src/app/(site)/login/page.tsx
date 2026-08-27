"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { CutButton } from "@/components/ui/CutButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/pricing";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <GlassCard cut className="w-full max-w-md p-8">
      <p className="mono-label text-[12px] text-cyan">Paddock Access</p>
      <h1 className="display-skew mt-3 text-3xl text-text-primary">Sign In</h1>

      {sent ? (
        <p className="mt-6 text-[15px] text-text-secondary">
          Check <span className="text-text-primary">{email}</span> for a one-time
          sign-in link.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@team.com"
            className="w-full border border-panel-border bg-black/20 px-4 py-3 font-body text-[15px] text-text-primary outline-none focus:border-cyan"
          />
          <CutButton type="submit" disabled={loading} className="w-full">
            {loading ? "Sending…" : "Send magic link"}
          </CutButton>
          {error ? (
            <p className="mono-label text-[11px] text-red">{error}</p>
          ) : null}
        </form>
      )}
    </GlassCard>
  );
}

export default function LoginPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-5 py-24">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </section>
  );
}
