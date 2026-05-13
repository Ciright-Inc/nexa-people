import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { email?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Placeholder:
  // - In production, call Spring Boot (SMTP/SES) to send reset email
  // - Always return a generic success to avoid account enumeration
  return NextResponse.json({ ok: true });
}

