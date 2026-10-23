
"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const DEFAULT_AUTHOR_ID = "6acd0838e5f103816d8cd679";

export default function PostsDashboard() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [authorId, setAuthorId] = useState(DEFAULT_AUTHOR_ID);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/posts`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Posts fetch nahi ho paayi.");
      }

      setPosts(
        Array.isArray(data)
          ? data
          : Array.isArray(data.posts)
            ? data.posts
            : []
      );
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend se connection nahi ho raha. Backend server check karo."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  const loadPosts = async () => {
    await fetchPosts();
  };

  loadPosts();
}, [fetchPosts]);

  // Create a new post or update an existing post
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!title.trim() || !content.trim()) {
      setError("Title aur content dono required hain.");
      return;
    }

    if (!editingPostId && !authorId.trim()) {
      setError("Author ID required hai.");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl;
      let imagePublicId;

      // Upload a newly selected image
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.message || "Image upload nahi ho paayi."
          );
        }

        imageUrl = uploadData.imageUrl;
        imagePublicId = uploadData.publicId;
      }

      const isEditing = Boolean(editingPostId);

      const requestBody = {
        title: title.trim(),
        content: content.trim(),
      };

      if (isEditing) {
        // Include image fields only when a new image was uploaded.
        if (imageUrl !== undefined) {
          requestBody.imageUrl = imageUrl;
          requestBody.imagePublicId = imagePublicId;
        }
      } else {
        requestBody.authorId = authorId.trim();
        requestBody.imageUrl = imageUrl || "";
        requestBody.imagePublicId = imagePublicId || "";
      }

      const response = await fetch(
        isEditing
          ? `${API_URL}/posts/${editingPostId}`
          : `${API_URL}/posts`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Post update nahi ho paayi."
              : "Post create nahi ho paayi.")
        );
      }

      setTitle("");
      setContent("");
      setImageFile(null);
      setEditingPostId(null);

      setMessage(
        isEditing
          ? "Post successfully update ho gayi!"
          : "Post successfully create ho gayi!"
      );

      await fetchPosts();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend se connection nahi ho raha. Backend server check karo."
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Load an existing post into the form
  function handleEdit(post) {
    setEditingPostId(post._id);
    setTitle(post.title);
    setContent(post.content);
    setImageFile(null);
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Cancel editing
  function handleCancelEdit() {
    setEditingPostId(null);
    setTitle("");
    setContent("");
    setImageFile(null);
    setError("");
    setMessage("");
  }

  // Delete a post
  async function handleDelete(postId) {
    const confirmed = window.confirm(
      "Kya tum sach mein ye post delete karna chahti ho?"
    );

    if (!confirmed) return;

    setDeletingId(postId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Post delete nahi ho paayi.");
      }

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post._id !== postId)
      );

      if (editingPostId === postId) {
        handleCancelEdit();
      }

      setMessage("Post successfully delete ho gayi!");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend se connection nahi ho raha."
          : err.message
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "24px",
        color: "inherit",
      }}
    >
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>
          Posts Dashboard
        </h1>

        <p style={{ opacity: 0.75 }}>
          Manage your posts with the Cine-Stream Full Stack API.
        </p>
      </header>

      {/* Create / Update form */}
      <section
        style={{
          padding: "24px",
          border: "1px solid #8885",
          borderRadius: "14px",
          marginBottom: "32px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          {editingPostId ? "Edit Post" : "Create a Post"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="post-title">Title</label>

          <input
            id="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter post title"
            required
            maxLength={150}
            style={inputStyle}
          />

          <label htmlFor="post-content">Content</label>

          <textarea
            id="post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your post..."
            required
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <label htmlFor="post-image">
            Upload Image (Optional)
          </label>

          <input
            id="post-image"
            type="file"
            accept="image/*"
            onChange={(event) =>
              setImageFile(event.target.files?.[0] || null)
            }
            style={inputStyle}
          />

          {editingPostId && (
            <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>
              Nayi image select nahi karogi toh existing image preserve rahegi.
            </p>
          )}

          {!editingPostId && (
            <>
              <label htmlFor="post-author">Author ID</label>

              <input
                id="post-author"
                value={authorId}
                onChange={(event) => setAuthorId(event.target.value)}
                required
                style={inputStyle}
              />
            </>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              disabled={submitting}
              style={buttonStyle}
            >
              {submitting
                ? editingPostId
                  ? "Updating..."
                  : "Creating..."
                : editingPostId
                  ? "Update Post"
                  : "Create Post"}
            </button>

            {editingPostId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={submitting}
                style={{
                  ...buttonStyle,
                  background: "#666",
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {error && (
        <p role="alert" style={{ color: "#e05252", marginBottom: "16px" }}>
          {error}
        </p>
      )}

      {message && (
        <p role="status" style={{ color: "#24965b", marginBottom: "16px" }}>
          {message}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0 }}>All Posts ({posts.length})</h2>

        <button
          type="button"
          onClick={fetchPosts}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <p role="status">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts found. Create your first post above!</p>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {posts.map((post) => (
            <article
              key={post._id}
              style={{
                padding: "20px",
                border: "1px solid #8885",
                borderRadius: "12px",
                overflowWrap: "anywhere",
              }}
            >
              <h3 style={{ marginTop: 0 }}>{post.title}</h3>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  loading="lazy"
                  style={{
                    display: "block",
                    width: "100%",
                    maxWidth: "600px",
                    maxHeight: "400px",
                    objectFit: "contain",
                    borderRadius: "10px",
                    marginBottom: "16px",
                  }}
                />
              )}

              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {post.content}
              </p>

              {post.authorId?.name && (
                <p style={{ opacity: 0.75 }}>
                  Author: {post.authorId.name}
                </p>
              )}

              <small style={{ opacity: 0.7 }}>
                Post ID: {post._id}
              </small>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleEdit(post)}
                  disabled={submitting || deletingId === post._id}
                  style={buttonStyle}
                >
                  Edit Post
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(post._id)}
                  disabled={deletingId === post._id || submitting}
                  style={{
                    ...buttonStyle,
                    background: "#c0392b",
                  }}
                >
                  {deletingId === post._id ? "Deleting..." : "Delete Post"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "18px",
  border: "1px solid #8888",
  borderRadius: "8px",
  background: "transparent",
  color: "inherit",
  font: "inherit",
};

const buttonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#5b5bd6",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 600,
};

