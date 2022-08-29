import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  title: { type: String, trim: true, maxLength: 30 },
  description: { type: String, trim: true, minLength: 3 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

videoSchema.static("formatHashTags", (hashtags) => {
  return hashtags.split(",").map((word) => `#${word.trim()}`);
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
