"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getActiveUser } from "@/lib/user-scope"

type ManagedUser = {
  id: string
  email: string
  displayName: string
  role: string
  disabled: boolean
  createdAt: string
}

export default function AccountsPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loaded, setLoaded] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const me = getActiveUser()

  const refresh = useCallback(async () => {
    const response = await fetch("/api/auth/users")
    if (response.status === 403) {
      setForbidden(true)
      setLoaded(true)
      return
    }
    const data = await response.json().catch(() => null)
    setUsers(Array.isArray(data?.users) ? data.users : [])
    setLoaded(true)
  }, [])

  useEffect(() => {
    refresh().catch(() => setLoaded(true))
  }, [refresh])

  async function createAccount(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    const response = await fetch("/api/auth/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email, password }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      setMessage(data?.error || "That didn't save… try again.")
    } else {
      setMessage(`${displayName} can now sign in with ${email}.`)
      setDisplayName("")
      setEmail("")
      setPassword("")
      await refresh()
    }
    setBusy(false)
  }

  async function toggleDisabled(user: ManagedUser) {
    await fetch("/api/auth/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, disabled: !user.disabled }),
    })
    await refresh()
  }

  async function resetPassword(user: ManagedUser) {
    const newPassword = window.prompt(`New password for ${user.displayName} (8 characters or more):`)
    if (!newPassword) return
    const response = await fetch("/api/auth/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, newPassword }),
    })
    const data = await response.json().catch(() => null)
    setMessage(response.ok ? `Password updated for ${user.displayName}.` : data?.error || "That didn't save.")
  }

  if (loaded && forbidden) {
    return (
      <div className="max-w-xl">
        <h1 className="text-xl font-semibold tracking-tight">Accounts</h1>
        <p className="mt-2 text-sm text-muted-foreground">Only the owner can manage accounts.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every presenter signs in as themselves and only ever sees their own shows, listeners and scoreboards.
        </p>
      </div>

      <form onSubmit={createAccount} className="space-y-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-[15px] font-semibold">Add a presenter</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium">Name</span>
            <input className="h-11 w-full rounded-xl border border-border bg-background px-3 text-[14px]" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium">Email</span>
            <input type="email" className="h-11 w-full rounded-xl border border-border bg-background px-3 text-[14px]" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium">First password</span>
            <input className="h-11 w-full rounded-xl border border-border bg-background px-3 text-[14px]" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
          </label>
        </div>
        {message && <p className="text-[13px] font-medium text-brand-indigo">{message}</p>}
        <Button type="submit" className="rounded-xl" disabled={busy}>{busy ? "Saving…" : "Create account"}</Button>
      </form>

      <div className="rounded-2xl border border-border/70 bg-card shadow-sm">
        {users.map((user) => (
          <div key={user.id} className="flex flex-wrap items-center gap-3 border-b border-border/50 px-6 py-4 last:border-b-0">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">
                {user.displayName}
                {user.role === "owner" && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-indigo">Owner</span>}
                {user.disabled && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">Off</span>}
              </p>
              <p className="truncate text-[12px] text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => resetPassword(user)}>
                Reset password
              </Button>
              {user.role !== "owner" && user.id !== me?.id && (
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toggleDisabled(user)}>
                  {user.disabled ? "Switch on" : "Switch off"}
                </Button>
              )}
            </div>
          </div>
        ))}
        {loaded && users.length === 0 && <p className="px-6 py-4 text-sm text-muted-foreground">No accounts yet.</p>}
      </div>
    </div>
  )
}
