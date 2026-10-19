import { defineTool } from "eve/tools";
import { z } from "zod";
import { listSupportTickets, resolveRange } from "../../lib/api.js";

export default defineTool({
  description:
    "List customer support tickets within a date range. Useful for triage queues, workload reporting, and spotting trends.",
  inputSchema: z.object({
    lastDays: z.number().int().min(1).max(180).optional().describe("Relative range, e.g. 7 for the last 7 days. Preferred over from; the server computes the date."),
    from: z.string().optional(),
    to: z.string().optional(),
    status: z.enum(["open", "pending", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
    category: z
      .enum([
        "shipping", "returns", "product_quality", "sizing",
        "billing", "payment", "account", "other",
      ])
      .optional(),
    assignee: z.string().optional(),
    limit: z.number().int().min(1).max(500).optional(),
  }),
  async execute(input) {
    return listSupportTickets(resolveRange(input));
  },
});