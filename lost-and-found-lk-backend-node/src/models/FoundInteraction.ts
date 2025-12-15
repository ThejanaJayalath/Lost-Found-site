import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFoundInteraction extends Document {
  post: Types.ObjectId;
  finderName: string;
  finderContact: string;
  message?: string;
  createdAt: Date;
}

const foundInteractionSchema = new Schema<IFoundInteraction>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    finderName: { type: String, required: true },
    finderContact: { type: String, required: true },
    message: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const FoundInteraction = mongoose.model<IFoundInteraction>(
  "FoundInteraction",
  foundInteractionSchema,
);


