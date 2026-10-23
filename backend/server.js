require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");
const uploadsRouter = require("./routes/uploads");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/upload", uploadsRouter);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    message: "Cine-Stream Backend is running",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });