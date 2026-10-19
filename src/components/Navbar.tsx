"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut, Menu, Settings, X } from "lucide-react";

import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn, getInitials } from "@/lib/utils";

const publicNavItems = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
];

const authenticatedNavItems = [
  { label: "Documents", href: "/dashboard" },
  { label: "Add new", href: "/documents/new" },
  { label: "Pricing", href: "/pricing" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/#features") {
    return false;
  }

  if (href === "/dashboard") {
    return (
      pathname === "/dashboard" ||
      (pathname.startsWith("/documents/") && pathname !== "/documents/new")
    );
  }

  return pathname === href;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = session ? authenticatedNavItems : publicNavItems;
  const logoHref = session ? "/dashboard" : "/";

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  async function handleSignOut() {
    setAccountOpen(false);
    setMobileOpen(false);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="fixed z-50 w-full border-b border-(--border-subtle) bg-(--bg-primary)/95 backdrop-blur">
      <div className="wrapper navbar-height flex items-center justify-between py-4">
        <Link href={logoHref} className="flex items-center gap-1">
          <span className="logo-text">Docify</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7.5 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
              className={cn(
                "nav-link-base",
                isActivePath(pathname, item.href)
                  ? "nav-link-active"
                  : "text-(--text-primary) hover:opacity-70",
              )}
            >
              {item.label}
            </Link>
          ))}

          <div className="ml-2 flex items-center gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : session ? (
              <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Open account menu"
                  >
                    <Avatar size="lg">
                      <AvatarImage
                        src={session.user.image ?? undefined}
                        alt={session.user.name ?? "User"}
                      />
                      <AvatarFallback className="bg-(--color-brand) text-sm font-semibold text-white">
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={8}
                  className="shadow-soft-lg w-64 rounded-xl border border-(--border-subtle) bg-(--bg-secondary) p-0"
                >
                  <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                    <Avatar size="lg">
                      <AvatarImage
                        src={session.user.image ?? undefined}
                        alt={session.user.name ?? "User"}
                      />
                      <AvatarFallback className="bg-(--color-brand) text-sm font-semibold text-white">
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-semibold text-(--text-primary)">
                        {session.user.name}
                      </span>
                      <span className="truncate text-xs text-(--text-muted)">
                        {session.user.email}
                      </span>
                    </div>
                  </div>

                  <Separator className="bg-(--border-subtle)" />

                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-(--text-primary)">
                      Theme
                    </span>
                    <ThemeToggle />
                  </div>

                  <Separator className="bg-(--border-subtle)" />

                  <Link
                    href="/settings"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--bg-tertiary)"
                  >
                    <Settings className="size-4" />
                    Settings
                  </Link>

                  <Separator className="bg-(--border-subtle)" />

                  <button
                    onClick={handleSignOut}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-b-xl px-4 py-3 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--bg-tertiary)"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <>
                <ThemeToggle />
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-(--color-brand) text-white hover:bg-(--color-brand-hover) dark:text-black"
                >
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg bg-(--bg-secondary) transition-colors hover:bg-(--bg-tertiary)"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? (
              <X className="size-5 text-(--text-primary)" />
            ) : (
              <Menu className="size-5 text-(--text-primary)" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-menu"
          className="border-t border-(--border-subtle) bg-(--bg-primary) px-5 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActivePath(pathname, item.href)
                    ? "bg-(--bg-secondary) text-(--color-brand)"
                    : "text-(--text-primary) hover:bg-(--bg-secondary)",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {session ? (
            <div className="mt-4 border-t border-(--border-subtle) pt-4">
              <p className="truncate text-sm font-semibold text-(--text-primary)">
                {session.user.name}
              </p>
              <p className="mb-3 truncate text-xs text-(--text-muted)">
                {session.user.email}
              </p>
              <div className="flex flex-col gap-1">
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-(--text-primary) hover:bg-(--bg-secondary)"
                >
                  <Settings className="size-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-(--text-primary) hover:bg-(--bg-secondary)"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex gap-2 border-t border-(--border-subtle) pt-4">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 bg-(--color-brand) text-white hover:bg-(--color-brand-hover) dark:text-black"
              >
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}
