import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;

    console.log("Metadata GET Received params:", params.id);
    if (!params.id) {
      return NextResponse.json(
        { message: "Metadata ID is required" },
        { status: 400 }
      );
    }
    const metadata = await prisma.metadata.findUnique({
      where: {
        id: params.id,
      },
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
