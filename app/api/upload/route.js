import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "No image file provided" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json(
      {
        message: "Image uploaded successfully",
        imageUrl: dataUrl,
        publicId: `upload_${Date.now()}`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Upload failed", error: error.message },
      { status: 500 }
    );
  }
}
