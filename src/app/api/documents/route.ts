import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { listDocumentsForUser } from "@/lib/documents/queries";
import { createDocumentFromUploads } from "@/lib/documents/service";
import { createDocumentSchema } from "@/lib/zod";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await listDocumentsForUser(session.user.id);

  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = createDocumentSchema.parse(await request.json());
    const created = await createDocumentFromUploads(session.user.id, payload);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create document.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
