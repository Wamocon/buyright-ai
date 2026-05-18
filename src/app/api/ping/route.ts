export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    return new Response(
      JSON.stringify({ ok: true, ts: Date.now(), node: process.version }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }
}
