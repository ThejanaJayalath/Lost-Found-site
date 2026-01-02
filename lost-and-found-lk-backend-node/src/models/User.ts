import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber?: string;
  termsAgreed?: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
  blocked: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: false },
    fullName: { type: String, required: true },
    phoneNumber: { type: String },
    termsAgreed: { type: Boolean, default: false },
    roles: { type: [String], default: ["USER"] },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);


