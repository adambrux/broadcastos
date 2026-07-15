"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  ChevronDown,
  Gauge,
  Menu,
  Newspaper,
  Radio,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { NowOnAirBanner } from "@/components/now-on-air-banner"
import { openAppSplash } from "@/components/app-splash-screen"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { isAdamShowLive } from "@/lib/schedule-data"
import { scheduleServerClock, useScheduleClock } from "@/lib/use-schedule-clock"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/mock-data"
import { broadcastOSVersion } from "@/lib/version"

const navigation = [
  { label: "Today", href: "/today", icon: Gauge },
  { label: "Produce", href: "/producer", icon: SlidersHorizontal },
  { label: "Presenter Hub", href: "/newsroom", icon: Newspaper },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "On Air", href: "/broadcast", icon: Radio },
] as const

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className="space-y-1">
      {navigation.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              active && "bg-brand-soft text-brand-indigo shadow-[inset_0_0_0_1px_rgba(42,59,172,.05)]",
              mobile && "h-12"
            )}
          >
            <Icon className={cn("size-[18px]", active && "text-brand-indigo")} strokeWidth={1.8} />
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span>{label}</span>
              {label === "On Air" && <span className="studio-live-dot size-1.5" aria-hidden="true" />}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={openAppSplash}
      className={cn("inline-flex flex-col items-start text-left", compact ? "gap-1" : "gap-2")}
      aria-label="Open BroadcastOS menu"
    >
      <Image src="/premier-logo.svg" alt="Premier" width={126} height={59} priority className={cn("h-auto", compact ? "w-[82px]" : "w-[112px]")} />
      <span className="flex flex-wrap items-center gap-2 pl-1">
        <span className={cn("font-semibold tracking-[-0.015em] text-foreground", compact ? "text-[12px]" : "text-[15px]")}>BroadcastOS</span>
        <span className={cn("rounded-full bg-ink px-2 py-0.5 font-mono font-semibold text-white", compact ? "text-[9px]" : "text-[10px]")}>v{broadcastOSVersion.code}</span>
      </span>
    </button>
  )
}

export function StudioLivePill({ dark = false, className }: { dark?: boolean; className?: string }) {
  const clock = useScheduleClock()
  const ready = clock !== scheduleServerClock
  const live = ready && isAdamShowLive(new Date(clock))

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        live
          ? "border-red-200 bg-red-50 text-red-700"
          : dark ? "border-white/10 bg-white/[0.05] text-white/40" : "border-border/70 bg-muted/40 text-muted-foreground",
        live && dark && "border-red-300/30 bg-red-500/15 text-red-200",
        className
      )}
    >
      {live && <span className="studio-live-dot" aria-hidden="true" />}
      {live ? "On air" : "Off air"}
    </span>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[224px] border-r border-border/70 bg-sidebar px-4 py-7 lg:flex lg:flex-col">
        <div className="px-2">
          <Brand />
          <div className="mt-4">
            <StudioLivePill className="w-full justify-center" />
          </div>
        </div>
        <div className="mt-9 min-h-0 flex-1 overflow-y-auto pr-1">
          <NavigationLinks />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-accent">
              <span className="grid size-9 place-items-center rounded-full bg-brand-indigo text-xs font-semibold text-white">{currentUser.initials}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{currentUser.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{currentUser.role}</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-52">
            <DropdownMenuLabel>{currentUser.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Switch station</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur lg:hidden">
        <Brand compact />
        <div className="flex items-center gap-2">
          <StudioLivePill />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[290px] p-5">
              <SheetHeader className="mb-8 text-left">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand />
              </SheetHeader>
              <NavigationLinks mobile />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="min-h-screen lg:pl-[224px]">
        <div className="relative mx-auto max-w-[1460px] px-5 py-6 sm:px-8 sm:py-8 xl:px-12 xl:py-10">
          {pathname !== "/broadcast" && <NowOnAirBanner className="mb-6" />}
          {children}
        </div>
      </main>
    </div>
  )
}
