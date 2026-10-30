import { NextResponse } from "next/server";
import { getPosts, addPost } from "./store";

export async function GET() {
  const posts = getPosts();
  return NextResponse.json({
    count: posts.length,
    posts,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, authorId, imageUrl, imagePublicId } = body;

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { message: "Title, content, and authorId are required" },
        { status: 400 }
      );
    }

    const created = addPost({
      title: title.trim(),
      content: content.trim(),
      authorId: authorId.trim(),
      imageUrl: imageUrl || "",
      imagePublicId: imagePublicId || "",
    });

    return NextResponse.json(
      { message: "Post created successfully", post: created },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create post", error: error.message },
      { status: 500 }
    );
  }
}
