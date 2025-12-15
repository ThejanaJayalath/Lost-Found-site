import mongoose, { Schema, Document, Types } from "mongoose";

export type ItemType = "ELECTRONICS" | "DOCUMENTS" | "CLOTHING" | "OTHER";

export type PostStatus = "PENDING" | "ACTIVE" | "RESOLVED" | "REJECTED";

export interface IPost extends Document {
  title: string;
  description: string;
  location: string;
  date: Date;
  itemType: ItemType;
  isLost: boolean;
  user: Types.ObjectId;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    itemType: {
      type: String,
      enum: ["ELECTRONICS", "DOCUMENTS", "CLOTHING", "OTHER"],
      required: true,
    },
    isLost: { type: Boolean, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Post = mongoose.model<IPost>("Post", postSchema);


