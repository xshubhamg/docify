import { auth } from "@/lib/auth";
import { listDocumentsForUser } from "@/lib/documents/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FileUp } from "lucide-react";
import DocumentsGrid from "@/components/DocumentsGrid";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const documents = await listDocumentsForUser(session.user.id);

  return (
    <div className="container wrapper">
      {/* Header Banner */}
      <div className="relative w-full h-[240px] md:h-[300px] rounded-2xl overflow-hidden">
        <Image
          src="/lofi-girl.jpg"
          alt="Dashboard banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end p-6 md:p-8">
          <Link
            href="/documents/new"
            className="btn-primary gap-2 font-mona-sans"
          >
            <FileUp className="size-5" />
            Add new doc
          </Link>
        </div>
      </div>

      {/* Documents Section */}
      <DocumentsGrid books={documents} />
    </div>
  );
}
