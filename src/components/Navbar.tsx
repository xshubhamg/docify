"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

const navItems = [
  {
    label: "Documents",
    href: "/",
  },
  {
    label: "Add new",
    href: "/documents/new",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="w-full fixed z-50 bg-(--bg-primary)">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-1">
          <span className="logo-text">Docify</span>
        </Link>

        <nav className="w-fit flex gap-7.5 items-center">
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

          <div className="flex items-center gap-2 ml-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-(--color-brand) hover:bg-(--color-brand-hover) text-white dark:text-black"
            >
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
