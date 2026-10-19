import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import { auth } from "@/lib/auth";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
