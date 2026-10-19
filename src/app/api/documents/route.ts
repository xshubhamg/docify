import { NextResponse } from "next/server";

import { requireSession, toErrorResponse } from "@/lib/api";
import { listDocumentsForUser } from "@/lib/documents/queries";
import { createDocumentFromUploads } from "@/lib/documents/service";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createDocumentSchema } from "@/lib/zod";

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const documents = await listDocumentsForUser(session.user.id);

    return NextResponse.json({ documents });
  } catch (error) {
    return toErrorResponse(error, "Could not load documents.");
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const limited = await enforceRateLimit({
      name: "documents:create",
      identifier: session.user.id,
      limit: 10,
      windowSeconds: 600,
    });

    if (limited) {
      return limited;
    }

    const payload = createDocumentSchema.parse(await request.json());
    const created = await createDocumentFromUploads(session.user.id, payload);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Failed to create document.");
  }
}
