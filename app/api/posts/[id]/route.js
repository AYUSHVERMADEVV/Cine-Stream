import { NextResponse } from "next/server";
import { updatePost, deletePost } from "../store";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, imageUrl, imagePublicId, authorId } = body;
    const headerAuthorId = request.headers.get("x-author-id");
    const requestingAuthorId = authorId || headerAuthorId;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      );
    }

    const result = updatePost(
      id,
      {
        title: title.trim(),
        content: content.trim(),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imagePublicId !== undefined && { imagePublicId }),
      },
      requestingAuthorId
    );

    if (result.error === "not_found") {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    if (result.error === "forbidden") {
      return NextResponse.json(
        { message: result.message || "Only the post creator can update this post." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Post updated successfully", post: result.post },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update post", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const headerAuthorId = request.headers.get("x-author-id");
    const url = new URL(request.url);
    const queryAuthorId = url.searchParams.get("authorId");
    const requestingAuthorId = headerAuthorId || queryAuthorId;

    const result = deletePost(id, requestingAuthorId);

    if (result.error === "not_found") {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    if (result.error === "forbidden") {
      return NextResponse.json(
        { message: result.message || "Only the post creator can delete this post." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Post deleted successfully", post: result.post },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete post", error: error.message },
      { status: 500 }
    );
  }
}
