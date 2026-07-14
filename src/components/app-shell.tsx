"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  ChevronDown,
  Gauge,
  Headphones,
  Menu,
  Mic2,
  Newspaper,
  Radio,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiveStatusPill, StudioSignalStrip } from "@/components/studio-motion"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/mock-data"

const navigation = [
  { label: "Today", href: "/today", icon: Gauge },
  { label: "Producer Desk", href: "/producer", icon: SlidersHorizontal },
  { label: "Presenter Hub", href: "/newsroom", icon: Newspaper },
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
    <Link href="/today" className={cn("inline-flex flex-col items-start", compact ? "gap-1" : "gap-2")} aria-label="Premier BroadcastOS home">
      <Image src="/premier-logo.svg" alt="Premier" width={126} height={59} priority className={cn("h-auto", compact ? "w-[82px]" : "w-[112px]")} />
      <span className={cn("pl-1 font-semibold tracking-[-0.015em] text-foreground", compact ? "text-[12px]" : "text-[15px]")}>BroadcastOS</span>
    </Link>
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
            <LiveStatusPill label="Studio alive" className="w-full justify-center" />
          </div>
        </div>
        <div className="mt-9 min-h-0 flex-1 overflow-y-auto pr-1">
          <NavigationLinks />
        </div>
        <div className="mb-4">
          <StudioSignalStrip message="Producer Desk · On Air · Presenter Hub ready" />
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
            <div className="mt-6">
              <StudioSignalStrip message="Studio signal active" />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="min-h-screen lg:pl-[224px]">
        <div className="relative mx-auto max-w-[1460px] px-5 py-6 sm:px-8 sm:py-8 xl:px-12 xl:py-10">
          {pathname === "/dashboard" && <div className="absolute right-[210px] top-10 z-10 hidden items-center gap-1 lg:flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Search"><Search /></Button>
              </TooltipTrigger>
              <TooltipContent>Search BroadcastOS</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                  <Bell />
                  <span className="absolute right-2 top-1.5 size-1.5 rounded-full bg-brand-magenta" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>3 notifications</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Studio monitor"><Headphones /></Button>
              </TooltipTrigger>
              <TooltipContent>Studio monitor</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Microphone status"><Mic2 /></Button>
              </TooltipTrigger>
              <TooltipContent>Microphone ready</TooltipContent>
            </Tooltip>
          </div>}
          {children}
        </div>
      </main>
    </div>
  )
}
