import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, customCode } = body;

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Use custom code or generate
    const code = customCode || generateCode();

    // Validate code pattern: alphanumeric 6-8 chars
    const CODE_RE = /^[A-Za-z0-9]{6,8}$/;
    if (!CODE_RE.test(code)) {
      return NextResponse.json({ error: "Invalid code format. Codes must match [A-Za-z0-9]{6,8}." }, { status: 400 });
    }

    // Check duplicate
    const exists = await prisma.link.findUnique({ where: { code } });
    if (exists) {
      return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    }

    // Create link
    const link = await prisma.link.create({
      data: { url, code },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
