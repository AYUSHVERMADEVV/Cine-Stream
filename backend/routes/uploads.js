const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
storage,
limits: {
fileSize: 5 * 1024 * 1024,
},
fileFilter: (req, file, cb) => {
if (file.mimetype && file.mimetype.startsWith("image/")) {
cb(null, true);
} else {
cb(new Error("Only image files are allowed."));
}
},
});

router.post("/", upload.single("image"), async (req, res) => {
try {
if (!req.file) {
return res.status(400).json({
message: "Please select an image to upload.",
});
}

const result = await new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: "cine-stream/posts",
      resource_type: "image",
    },
    (error, uploadedImage) => {
      if (error) {
        reject(error);
      } else {
        resolve(uploadedImage);
      }
    }
  );

  stream.end(req.file.buffer);
});

return res.status(201).json({
  message: "Image uploaded successfully!",
  imageUrl: result.secure_url,
  publicId: result.public_id,
});

} catch (error) {
console.error("Image upload failed:", error.message);

return res.status(500).json({
  message: "Image upload failed. Please try again.",
});

}
});

router.use((error, req, res, next) => {
if (error instanceof multer.MulterError) {
return res.status(400).json({
message:
error.code === "LIMIT_FILE_SIZE"
? "Image size must not exceed 5 MB."
: error.message,
});
}

if (error.message === "Only image files are allowed.") {
return res.status(400).json({
message: error.message,
});
}

return next(error);
});

module.exports = router;
