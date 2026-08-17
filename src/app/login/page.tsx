"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { setActiveUser } from "@/lib/user-scope"

type SessionUser = { id: string; displayName: string; role: "owner" | "presenter" }

export default function LoginPage() {
  const [needsSetup, setNeedsSetup] = useState(false)
  const [checked, setChecked] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch("/api/auth/setup")
      .then((response) => response.json())
      .then((data) => setNeedsSetup(Boolean(data?.needsSetup)))
      .catch(() => {})
      .finally(() => setChecked(true))
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const endpoint = needsSetup ? "/api/auth/setup" : "/api/auth/login"
      const payload = needsSetup ? { displayName, email, password } : { email, password }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.user) {
        setError(data?.error || "Sign in didn't work… try again.")
        setBusy(false)
        return
      }
      const user = data.user as SessionUser
      setActiveUser({ id: user.id, name: user.displayName, role: user.role })
      window.location.href = "/"
    } catch {
      setError("Something went wrong on the way to the studio… try again.")
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background bg-[radial-gradient(circle_at_75%_10%,rgba(237,27,152,0.06),transparent_30rem),radial-gradient(circle_at_20%_85%,rgba(42,59,172,0.07),transparent_32rem)] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image src="/premier-logo.svg" alt="Premier" width={126} height={59} priority className="h-auto w-[112px]" />
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">BroadcastOS</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {needsSetup ? "First time here… create the owner account." : "Sign in to your studio."}
            </p>
          </div>
        </div>

        {checked && (
          <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border/60 bg-card/80 p-7 shadow-[var(--shadow-lift)] backdrop-blur-xl">
            {needsSetup && (
              <label className="block">
                <span className="mb-1 block text-[13px] font-medium">Your name</span>
                <input
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[15px] outline-none hover:border-brand-indigo/30 focus:border-brand-indigo/40 focus:ring-2 focus:ring-brand-indigo/25"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-[13px] font-medium">Email</span>
              <input
                type="email"
                className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[15px] outline-none hover:border-brand-indigo/30 focus:border-brand-indigo/40 focus:ring-2 focus:ring-brand-indigo/25"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[13px] font-medium">Password</span>
              <input
                type="password"
                className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[15px] outline-none hover:border-brand-indigo/30 focus:border-brand-indigo/40 focus:ring-2 focus:ring-brand-indigo/25"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={needsSetup ? "new-password" : "current-password"}
                minLength={needsSetup ? 8 : undefined}
                required
              />
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-700">{error}</p>}
            <Button type="submit" className="h-11 w-full rounded-xl" disabled={busy}>
              {busy ? "One moment…" : needsSetup ? "Create owner account" : "Sign in"}
            </Button>
            {!needsSetup && (
              <p className="text-center text-[12px] text-muted-foreground">
                No account? The owner creates them from the Accounts page.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
