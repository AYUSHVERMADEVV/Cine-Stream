"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "/api"
).replace(/\/$/, "");

const DEFAULT_AUTHOR_ID = "6acd0838e5f103816d8cd679";
const DEFAULT_AUTHOR_NAME = "Ayush";

export default function PostsDashboard() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Active User / Author State
  const [currentUserId, setCurrentUserId] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("cine-stream-author-id") || DEFAULT_AUTHOR_ID;
      } catch {
        return DEFAULT_AUTHOR_ID;
      }
    }
    return DEFAULT_AUTHOR_ID;
  });

  const [currentUserName, setCurrentUserName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("cine-stream-author-name") || DEFAULT_AUTHOR_NAME;
      } catch {
        return DEFAULT_AUTHOR_NAME;
      }
    }
    return DEFAULT_AUTHOR_NAME;
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Three dots menu state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close three dots menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/posts`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load posts.");
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
          ? "Unable to reach server. Please try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(`${API_URL}/posts`);
        const data = await response.json();

        if (active) {
          if (!response.ok) {
            throw new Error(data.message || "Failed to load posts.");
          }
          setPosts(
            Array.isArray(data)
              ? data
              : Array.isArray(data.posts)
                ? data.posts
                : []
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.message === "Failed to fetch"
              ? "Unable to reach server. Please try again."
              : err.message
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  // Switch demo user to verify author restriction
  function handleToggleUser() {
    if (currentUserId === DEFAULT_AUTHOR_ID) {
      const newId = "guest_cinephile_99";
      const newName = "Guest Cinephile";
      setCurrentUserId(newId);
      setCurrentUserName(newName);
      try {
        localStorage.setItem("cine-stream-author-id", newId);
        localStorage.setItem("cine-stream-author-name", newName);
      } catch {}
      setMessage("Switched user to 'Guest Cinephile'. You will only be able to edit/delete posts you create!");
    } else {
      setCurrentUserId(DEFAULT_AUTHOR_ID);
      setCurrentUserName(DEFAULT_AUTHOR_NAME);
      try {
        localStorage.setItem("cine-stream-author-id", DEFAULT_AUTHOR_ID);
        localStorage.setItem("cine-stream-author-name", DEFAULT_AUTHOR_NAME);
      } catch {}
      setMessage("Switched user back to 'Ayush' (Primary Creator).");
    }
    setActiveMenuId(null);
  }

  // Open Create Modal
  function handleOpenCreate() {
    setEditingPostId(null);
    setTitle("");
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    setError("");
    setMessage("");
    setIsModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(post) {
    const postAuthorId = post.authorId?._id || post.authorId;
    if (String(postAuthorId) !== String(currentUserId)) {
      setError("Only the creator of this post can edit it.");
      setActiveMenuId(null);
      return;
    }

    setEditingPostId(post._id);
    setTitle(post.title || "");
    setContent(post.content || "");
    setImageFile(null);
    setImagePreview(post.imageUrl || null);
    setError("");
    setMessage("");
    setActiveMenuId(null);
    setIsModalOpen(true);
  }

  // Close Modal
  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingPostId(null);
    setTitle("");
    setContent("");
    setImageFile(null);
    setImagePreview(null);
  }

  // Handle image file selection
  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  // Create or Update Post
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl;
      let imagePublicId;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Image upload failed.");
        }

        imageUrl = uploadData.imageUrl;
        imagePublicId = uploadData.publicId;
      }

      const isEditing = Boolean(editingPostId);
      const requestBody = {
        title: title.trim(),
        content: content.trim(),
        authorId: currentUserId,
      };

      if (isEditing) {
        if (imageUrl !== undefined) {
          requestBody.imageUrl = imageUrl;
          requestBody.imagePublicId = imagePublicId;
        }
      } else {
        requestBody.authorName = currentUserName;
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
            "x-author-id": currentUserId,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || (isEditing ? "Failed to update post." : "Failed to create post.")
        );
      }

      handleCloseModal();
      setMessage(
        isEditing
          ? "Post updated successfully!"
          : "Post published successfully!"
      );

      await fetchPosts();
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete Post (Author-Only check)
  async function handleDelete(post) {
    const postAuthorId = post.authorId?._id || post.authorId;

    // Client-side verification
    if (String(postAuthorId) !== String(currentUserId)) {
      setError("Only the creator of this post can delete it.");
      setActiveMenuId(null);
      return;
    }

    setActiveMenuId(null);
    setDeletingId(post._id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/posts/${post._id}?authorId=${encodeURIComponent(currentUserId)}`,
        {
          method: "DELETE",
          headers: {
            "x-author-id": currentUserId,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post.");
      }

      setPosts((current) => current.filter((p) => p._id !== post._id));
      setMessage("Post deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete post.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="community-section">
      {/* Page Header */}
      <div className="community-header">
        <div>
          <div className="community-badge">
            <Sparkles size={14} className="badge-icon" />
            <span>COMMUNITY FEED</span>
          </div>
          <h1 className="community-title">Community Posts</h1>
          <p className="community-subtitle">
            Share movie reviews, discussions, and cinephile recommendations.
          </p>

          {/* Active Author Identity Indicator */}
          <div className="active-user-bar">
            <span className="active-user-badge" suppressHydrationWarning>
              <UserCheck size={14} />
              <span suppressHydrationWarning>Logged in as: <strong suppressHydrationWarning>{currentUserName}</strong></span>
            </span>
            <button
              type="button"
              onClick={handleToggleUser}
              className="switch-user-btn"
              title="Switch user to verify that only the creator can edit or delete their posts"
            >
              Switch User Demo
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="create-post-cta"
        >
          <Plus size={18} />
          <span>Create Post</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="alert-box alert-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="alert-box alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Posts Feed */}
      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading community discussions...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={44} className="empty-icon" />
          <h3>No posts yet</h3>
          <p>Be the first movie enthusiast to share thoughts with the community!</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="create-post-cta"
            style={{ marginTop: "16px" }}
          >
            <Plus size={18} />
            <span>Create First Post</span>
          </button>
        </div>
      ) : (
        <div className="posts-feed" ref={menuRef}>
          {posts.map((post) => {
            const authorInitial = (post.authorId?.name || "U")[0].toUpperCase();
            const postAuthorId = post.authorId?._id || post.authorId;
            const isCreator = String(postAuthorId) === String(currentUserId);
            const isMenuOpen = activeMenuId === post._id;
            const isDeleting = deletingId === post._id;

            return (
              <article
                key={post._id}
                className={`post-card ${isDeleting ? "post-deleting" : ""}`}
              >
                {/* Post Card Header */}
                <div className="post-header">
                  <div className="post-author-info">
                    <div className="author-avatar">{authorInitial}</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }} suppressHydrationWarning>
                        <h4 className="author-name">
                          {post.authorId?.name || "Community Member"}
                        </h4>
                        {isCreator && (
                          <span className="creator-tag">
                            <ShieldCheck size={12} /> You (Author)
                          </span>
                        )}
                      </div>
                      <span className="post-date" suppressHydrationWarning>
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </div>
                  </div>

                  {/* Three Dots Menu Button — SHOWN ONLY TO AUTHOR / CREATOR */}
                  {isCreator && (
                    <div className="menu-container">
                      <button
                        type="button"
                        aria-label="Post actions"
                        className="three-dots-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : post._id);
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="menu-dropdown">
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => handleOpenEdit(post)}
                          >
                            <Pencil size={15} />
                            <span>Edit Post</span>
                          </button>

                          <button
                            type="button"
                            className="dropdown-item dropdown-item-danger"
                            onClick={() => handleDelete(post)}
                          >
                            <Trash2 size={15} />
                            <span>Delete Post</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <h3 className="post-title">{post.title}</h3>

                {post.imageUrl && (
                  <div className="post-image-container">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      loading="lazy"
                      className="post-image"
                    />
                  </div>
                )}

                <p className="post-body">{post.content}</p>
              </article>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>{editingPostId ? "Edit Post" : "Create a Post"}</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="modal-close-button"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="post-title">Post Title</label>
                <input
                  id="post-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. My thoughts on Dune: Part Two"
                  required
                  maxLength={150}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="post-content">Content / Discussion</label>
                <textarea
                  id="post-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your review or recommendation..."
                  required
                  rows={5}
                  className="modal-input modal-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="post-image">
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ImageIcon size={16} />
                    <span>Upload Image (Optional)</span>
                  </span>
                </label>
                <input
                  id="post-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="modal-file-input"
                />

                {imagePreview && (
                  <div className="preview-container">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="preview-image"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="remove-image-btn"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="btn-cancel"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-submit"
                >
                  {submitting
                    ? editingPostId
                      ? "Updating..."
                      : "Publishing..."
                    : editingPostId
                      ? "Update Post"
                      : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
