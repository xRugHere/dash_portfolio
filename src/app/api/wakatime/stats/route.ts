export const dynamic = "force-dynamic"

export async function GET() {
  const apiKey = process.env.WAKATIME_API_KEY;
  
  if (!apiKey) {
    return Response.json({ error: "WakaTime API key not configured" }, { status: 500 });
  }
  
  const encoded = Buffer.from(apiKey).toString("base64");

  const res = await fetch(
    "https://wakatime.com/api/v1/users/current/stats/last_7_days",
    {
      headers: { Authorization: `Basic ${encoded}` },
      next: { revalidate: 3600 },
    }
  );

  const { data } = await res.json();

  return Response.json({
    totalSeconds: data.total_seconds,
    languages: data.languages.slice(0, 6).map((l: { name: string; percent: number; total_seconds: number }) => ({
      name: l.name,
      percent: l.percent,
      totalSeconds: l.total_seconds,
    })),
    dailySummaries: data.range?.days_including_holidays ?? [],
  });
}