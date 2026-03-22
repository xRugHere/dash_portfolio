export async function GET() {
  const scope = "user-read-recently-played user-top-read";
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