import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  key: string;
  value: any;
  updatedAt: Date;
  createdAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);

