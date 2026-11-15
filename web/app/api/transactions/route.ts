import { mockData } from "@/lib/mock-data";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const level = params.get("level");
  if (params.getAll("level").length > 1 || (level !== null && !["low", "medium", "high"].includes(level))) {
    return Response.json({ error: "level must be low, medium or high (provided once)." }, { status: 400 });
  }
  const rawLimit = params.get("limit");
  const max = mockData.transactions.length;
  if (params.getAll("limit").length > 1 || (rawLimit !== null && (!/^\d+$/.test(rawLimit) || Number(rawLimit) < 1 || Number(rawLimit) > max))) {
    return Response.json({ error: `limit must be an integer between 1 and ${max} (provided once).` }, { status: 400 });
  }
  const transactions = mockData.transactions
    .filter((tx) => level === null || tx.riskLevel === level)
    .sort((a, b) => b.riskScore - a.riskScore || b.timestamp.localeCompare(a.timestamp) || a.id.localeCompare(b.id))
    .slice(0, rawLimit === null ? max : Number(rawLimit));
  return Response.json(transactions);
}
