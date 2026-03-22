export async function GET() {
  const scope = [
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-read-recently-played",
    "user-top-read",
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope,
    redirect_uri: "https://dash-portfolio-ten.vercel.app/api/spotify/callback",
  });

  return Response.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
