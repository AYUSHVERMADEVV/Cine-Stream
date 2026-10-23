const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();

// GET all posts with author details
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("authorId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
});
// CREATE a new post
router.post("/", async (req, res) => {
  try {
   const { title, content, authorId, imageUrl, imagePublicId } = req.body;

    // Validate required fields
    if (!title || !content || !authorId) {
      return res.status(400).json({
        message: "Title, content, and authorId are required",
      });
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({
        message: "Invalid authorId format",
      });
    }

    // Check whether the author exists
    const author = await User.findById(authorId);

    if (!author) {
      return res.status(404).json({
        message: "Author not found. Please create the user first.",
      });
    }

    // Create the post with authorId
   const newPost = new Post({
  title,
  content,
  authorId,
  imageUrl: imageUrl || "",
  imagePublicId: imagePublicId || "",
});

    const savedPost = await newPost.save();

    return res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create post",
      error: error.message,
    });
  }
});

// UPDATE an existing post
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrl, imagePublicId } = req.body;

    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    // Validate required fields
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title.trim(),
          content: content.trim(),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(imagePublicId !== undefined && { imagePublicId }),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update post",
      error: error.message,
    });
  }
});

// DELETE a post
router.delete("/:id", async (req, res) => {
  try {
    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      message: "Post deleted successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete post",
      error: error.message,
    });
  }
});

module.exports = router;