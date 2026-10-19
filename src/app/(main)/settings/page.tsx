import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/settings/SignOutButton";
import { ThemePreference } from "@/components/settings/ThemePreference";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";

function getInitials(name?: string | null) {
  if (!name) {
    return "?";
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="wrapper container">
      <h1 className="page-title-xl mb-2">Settings</h1>
      <p className="subtitle mb-10 text-center">Manage your account and appearance.</p>

      <div className="mx-auto max-w-2xl space-y-6">
        <section className="shadow-soft rounded-xl border border-(--border-subtle) bg-(--bg-card) p-6">
          <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">Profile</h2>
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage
                src={session.user.image ?? undefined}
                alt={session.user.name ?? "User"}
              />
              <AvatarFallback className="bg-(--color-brand) text-sm font-semibold text-white">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-(--text-primary)">
                {session.user.name}
              </p>
              <p className="truncate text-sm text-(--text-muted)">{session.user.email}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-(--text-muted)">
            Profile editing is not built yet. Contact the maintainer if you need to change
            your name or email.
          </p>
        </section>

        <section className="shadow-soft rounded-xl border border-(--border-subtle) bg-(--bg-card) p-6">
          <h2 className="mb-1 text-lg font-semibold text-(--text-primary)">Appearance</h2>
          <p className="mb-4 text-sm text-(--text-muted)">
            Choose how Docify looks on this device.
          </p>
          <ThemePreference />
        </section>

        <section className="shadow-soft rounded-xl border border-(--border-subtle) bg-(--bg-card) p-6">
          <h2 className="mb-1 text-lg font-semibold text-(--text-primary)">Session</h2>
          <p className="mb-4 text-sm text-(--text-muted)">
            Signing out ends this session on this device.
          </p>
          <SignOutButton />
        </section>
      </div>
    </div>
  );
}
