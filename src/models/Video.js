import mongoose from "mongoose";
import { fileSchema } from "./File";

const videoSchema = new mongoose.Schema({
  file: { type: fileSchema, required: true },
  thumbnail: { type: fileSchema, required: true },
  title: { type: String, trim: true, maxLength: 30 },
  description: { type: String, trim: true, minLength: 3 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
    likeUsers: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    ],
    dislikeUsers: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    ],
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Comment",
    },
  ],
});

videoSchema.static("formatHashTags", (hashtags) => {
  return hashtags.split(",").map((word) => `#${word.trim()}`);
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
