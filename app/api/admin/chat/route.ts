import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, ADMIN_PASSWORD } from "@/lib/admin-auth";
import { adminChatFlow } from "@/lib/workflows/admin-chat-flow";
import { createModelCallToUIChunkTransform } from "@ai-sdk/workflow";
import { createUIMessageStreamResponse, safeValidateUIMessages } from "ai";
import type { UIMessage } from "ai";
import { start } from "workflow/api";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_COOKIE_NAME)?.value !== ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.messages)) {
    return Response.json(
      { error: "The messages field must be an array" },
      { status: 400 },
    );
  }

  const validation = await safeValidateUIMessages<UIMessage>({
    messages: body.messages,
  });
  if (!validation.success) {
    return Response.json({ error: "Invalid chat messages" }, { status: 400 });
  }

  const messages = validation.data;
  const run = await start(adminChatFlow, [messages]);
  return createUIMessageStreamResponse({
    stream: run.readable.pipeThrough(createModelCallToUIChunkTransform()),
    headers: {
      "x-workflow-run-id": run.runId,
    },
  });
}