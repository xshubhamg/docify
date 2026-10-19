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
    <main id="main-content" className="wrapper container">
      {/* Header Banner */}
      <div className="relative h-[240px] w-full overflow-hidden rounded-2xl md:h-[300px]">
        <Image
          src="/lofi-girl.jpg"
          alt="Dashboard banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end p-6 md:p-8">
          <Link href="/documents/new" className="btn-primary font-mona-sans gap-2">
            <FileUp className="size-5" />
            Add new doc
          </Link>
        </div>
      </div>

      {/* Documents Section */}
      <DocumentsGrid documents={documents} />
    </main>
  );
}
