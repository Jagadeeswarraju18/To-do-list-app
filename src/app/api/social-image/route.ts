import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
    const filePath = path.join(process.cwd(), "public", "og-new.png");
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=0, s-maxage=31536000, immutable",
            "Content-Length": buffer.byteLength.toString(),
        },
    });
}
