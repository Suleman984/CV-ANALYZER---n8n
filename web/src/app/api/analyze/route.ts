import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "N8N_WEBHOOK_URL is not configured" },
      { status: 500 },
    );
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart body" },
      { status: 400 },
    );
  }

  const file = incoming.get("file");
  const name = incoming.get("name");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }

  const forward = new FormData();
  forward.append("file", file);
  if (typeof name === "string" && name.trim().length > 0) {
    forward.append("name", name.trim());
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    body: forward,
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": contentType || "text/plain; charset=utf-8" },
  });
}
