// Shared in-memory store for posts across Next.js API routes
const defaultPosts = [
  {
    _id: "post_sample_1",
    title: "Welcome to Cine-Stream!",
    content: "Discover your favorite films, save them to your favorites list, and explore trending cinema from around the globe.",
    authorId: {
      _id: "6acd0838e5f103816d8cd679",
      name: "Ayush",
      email: "ayush@example.com",
    },
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    imagePublicId: "cine_stream_intro",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "post_sample_2",
    title: "Top Sci-Fi Picks for the Weekend",
    content: "Interstellar and Inception are masterpieces of modern cinema. What are your favorite mind-bending movies?",
    authorId: {
      _id: "author_cinephile",
      name: "MovieFan",
      email: "fan@cinestream.com",
    },
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
    imagePublicId: "cine_stream_scifi",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

if (!globalThis.__cineStreamPostsStore) {
  globalThis.__cineStreamPostsStore = [...defaultPosts];
}

export function getPosts() {
  return globalThis.__cineStreamPostsStore;
}

export function getPostById(id) {
  return globalThis.__cineStreamPostsStore.find((p) => String(p._id) === String(id)) || null;
}

export function addPost(post) {
  const newPost = {
    _id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    ...post,
    authorId: typeof post.authorId === "string"
      ? { _id: post.authorId, name: post.authorName || "Community User", email: "user@example.com" }
      : post.authorId || { _id: "default_author", name: "Community User", email: "user@example.com" },
    createdAt: new Date().toISOString(),
  };
  globalThis.__cineStreamPostsStore.unshift(newPost);
  return newPost;
}

export function updatePost(id, updates, requestingAuthorId) {
  const index = globalThis.__cineStreamPostsStore.findIndex((p) => String(p._id) === String(id));
  if (index === -1) return { error: "not_found" };

  const post = globalThis.__cineStreamPostsStore[index];
  const postAuthorId = post.authorId?._id || post.authorId;

  // Strict Author Verification: Only creator can update
  if (requestingAuthorId && postAuthorId && String(requestingAuthorId) !== String(postAuthorId)) {
    return { error: "forbidden", message: "Only the post creator can update this post." };
  }

  globalThis.__cineStreamPostsStore[index] = {
    ...globalThis.__cineStreamPostsStore[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return { post: globalThis.__cineStreamPostsStore[index] };
}

export function deletePost(id, requestingAuthorId) {
  const index = globalThis.__cineStreamPostsStore.findIndex((p) => String(p._id) === String(id));
  if (index === -1) return { error: "not_found" };

  const post = globalThis.__cineStreamPostsStore[index];
  const postAuthorId = post.authorId?._id || post.authorId;

  // Strict Author Verification: Only creator can delete
  if (requestingAuthorId && postAuthorId && String(requestingAuthorId) !== String(postAuthorId)) {
    return { error: "forbidden", message: "Only the post creator can delete this post." };
  }

  const deleted = globalThis.__cineStreamPostsStore.splice(index, 1)[0];
  return { post: deleted };
}
