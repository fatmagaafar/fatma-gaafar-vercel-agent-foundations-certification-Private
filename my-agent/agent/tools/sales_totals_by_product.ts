import { defineTool } from "eve/tools";
import { z } from "zod";
import { salesTotalsByProduct, resolveRange } from "../../lib/api.js";

export default defineTool({
  description:
    "Sales totals for a date range, broken down by product. Sorted by units sold descending so bestsellers appear first. Available for ~180 days.",
  inputSchema: z.object({
    lastDays: z.number().int().min(1).max(180).optional().describe("Relative range, e.g. 7 for the last 7 days. Preferred over from; the server computes the date."),
    from: z.string().optional(),
    to: z.string().optional(),
    productId: z.string().optional(),
  }),
  async execute(input) {
    return salesTotalsByProduct(resolveRange(input));
  },
});