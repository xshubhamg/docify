import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileUp, FolderOpen } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="container wrapper">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-(--color-brand)/10 flex items-center justify-center mb-8">
          <FolderOpen className="size-10 text-(--color-brand)" />
        </div>

        <h1 className="page-title-xl mb-3">
          Welcome back, {firstName}
        </h1>
        <p className="subtitle mb-10 max-w-md">
          Your documents will appear here. Upload your first document to get
          started with AI-powered insights.
        </p>

        <Link
          href="/documents/new"
          className="btn-primary gap-2 text-lg px-8 py-4"
        >
          <FileUp className="size-5" />
          Upload your first document
        </Link>
      </div>
    </div>
  );
}
