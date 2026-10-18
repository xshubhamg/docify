"use client";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { Loader2, LogOut, Settings } from "lucide-react";
import { useState } from "react";

const publicNavItems = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
];

const authenticatedNavItems = [
  { label: "Documents", href: "/dashboard" },
  { label: "Add new", href: "/documents/new" },
  { label: "Pricing", href: "/pricing" },
];

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);

  const navItems = session ? authenticatedNavItems : publicNavItems;
  const logoHref = session ? "/dashboard" : "/";

  async function handleSignOut() {
    setOpen(false);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="fixed z-50 w-full bg-(--bg-primary)">
      <div className="wrapper navbar-height flex items-center justify-between py-4">
        <Link href={logoHref} className="flex items-center gap-1">
          <span className="logo-text">Docify</span>
        </Link>

        <nav className="flex w-fit items-center gap-7.5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link-base">
              <span
                className={cn(
                  "nav-link-base",
                  pathname === item.href
                    ? "nav-link-active"
                    : "text-(--text-primary) hover:opacity-70",
                )}
              >
                {item.label}
              </span>
            </Link>
          ))}

          <div className="ml-2 flex items-center gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : session ? (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
                    onClick={() => setOpen(false)}
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
      </div>
    </header>
  );
};

export default Navbar;
