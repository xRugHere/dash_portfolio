export const revalidate = 0;

export async function GET() {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
    }),
    cache: "no-store",
  });

  const { access_token } = await tokenRes.json();

  const nowPlayingRes = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: "no-store",
    }
  );

  if (nowPlayingRes.status === 204 || nowPlayingRes.status > 400) {
    return Response.json({ isPlaying: false });
  }

  const song = await nowPlayingRes.json();

  return Response.json({
    isPlaying: song.is_playing,
    title: song.item.name,
    artist: song.item.artists.map((a: { name: string }) => a.name).join(", "),
    albumArt: song.item.album.images[0].url,
    songUrl: song.item.external_urls.spotify,
  });
}