import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, ADMIN_PASSWORD } from "@/lib/admin-auth";
import { createModelCallToUIChunkTransform } from "@ai-sdk/workflow";
import { createUIMessageStreamResponse } from "ai";
import { getRun } from "workflow/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_COOKIE_NAME)?.value !== ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const startIndexParam = new URL(request.url).searchParams.get("startIndex");
  const parsed = startIndexParam ? parseInt(startIndexParam, 10) : undefined;
  const startIndex = Number.isNaN(parsed) ? undefined : parsed;

  const readable = getRun(id).getReadable({ startIndex });
  const tailIndex = await readable.getTailIndex();

  return createUIMessageStreamResponse({
    stream: readable.pipeThrough(createModelCallToUIChunkTransform()),
    headers: {
      "x-workflow-stream-tail-index": String(tailIndex),
    },
  });
}
