import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Redirect route: GET /:code
export async function GET(req, context) {
  try {
    const params = await context.params;
    const { code } = params;
    const link = await prisma.link.findUnique({ where: { code } });

    if (!link) {
      // If no link exists for this code, return a proper 404 (no redirect)
      notFound();
    }

    // Atomically increment clicks and update lastClicked using the prisma shim's increment support
    await prisma.link.update({
      where: { code },
      data: { clicks: { increment: 1 }, lastClicked: new Date() },
    });

    // Perform 302 redirect to the target URL
    return NextResponse.redirect(link.url, 302);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
