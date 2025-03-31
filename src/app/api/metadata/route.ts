import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    console.log("Metadata POST Received data:", data);

    const metadata = await prisma.metadata.create({
      data: {
        id: data.id,
        content: JSON.stringify(data),
      },
    });

    return NextResponse.json({ id: metadata.id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
