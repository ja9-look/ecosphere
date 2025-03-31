import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const id = pathname.split("/").pop();
    const metadata = await prisma.metadata.findUnique({
      where: { id },
    });

    if (!metadata) {
      return NextResponse.json(
        { message: "Metadata not found" },
        { status: 404 }
      );
    }

    const content = JSON.parse(metadata.content);

    return NextResponse.json({ metadata: content }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
