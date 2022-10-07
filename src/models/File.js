import mongoose from "mongoose";

export const fileSchema = new mongoose.Schema({
  url: String,
  filename: String,
});
