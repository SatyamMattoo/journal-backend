import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please enter the article title"],
    maxLength: [100, "Article title cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please enter the article description"],
    maxLength: [1000, "Article description cannot exceed 1000 characters"],
  },
  pdfFile: {
    type: String,
    required: [true, "Please upload the PDF file"],
  },
  status: {
    type: String,
    enum: [
      "submitted",
      "underreview",
      "resubmission",
      "readytopublish",
      "published",
      "certified"
    ],
    default: "submitted",
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
  volume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volume", // Reference to the Volume model
  },
  issue: {
    type: Number,
  },
  volumeNumber: {
    type: Number,
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
  },
});

export const Articles = mongoose.model("Article", articleSchema);
