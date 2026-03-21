import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import DocumentReaderClient from "@/components/documents/DocumentReaderClient";
import { getDocumentReaderData } from "@/lib/documents/queries";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;
  const document = await getDocumentReaderData(session.user.id, slug);

  if (!document) {
    notFound();
  }

  return (
    <main className="wrapper pt-[calc(var(--navbar-height)+24px)] pb-8">
      <DocumentReaderClient document={document} />
    </main>
  );
}
