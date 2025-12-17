import mongoose, { Schema, Document } from "mongoose";

// Match legacy Java ItemType enum exactly
export type ItemType =
  | "PHONE"
  | "LAPTOP"
  | "PURSE"
  | "WALLET"
  | "ID_CARD"
  | "DOCUMENT"
  | "PET"
  | "BAG"
  | "OTHER";

export type PostStatus = "LOST" | "FOUND" | "RESOLVED";
// Added LOST/FOUND to status just in case, though Java had them separate in query logic usually. 
// Java PostStatus was likely just PENDING, ACTIVE, RESOLVED, REJECTED.
// But user screenshots showed "RESOLVED".

export interface IPost extends Document {
  title: string;
  description: string;
  location: string;
  date: Date;
  time?: string; // Java has LocalTime, string is fine
  itemType: ItemType;
  status: PostStatus;

  // User Info (Stored directly on post in legacy)
  userId: string;
  userName?: string;
  userInitial?: string;
  contactName?: string;
  contactPhone?: string;

  // Media
  images: string[];

  // Type specific
  imei?: string;
  serialNumber?: string;
  idNumber?: string;
  color?: string;

  isLost: boolean; // Retaining this as it's useful helper
  hidden?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String },

    // Enum values from legacy ItemType
    itemType: {
      type: String,
      enum: [
        "PHONE",
        "LAPTOP",
        "PURSE",
        "WALLET",
        "ID_CARD",
        "DOCUMENT",
        "PET",
        "BAG",
        "OTHER",
        // Keep these temporarily to avoid breaking existing bad data if any
        "ELECTRONICS", "CLOTHING"
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["LOST", "FOUND", "RESOLVED"],
      default: "LOST", // Default to LOST if not specified
    },

    // User Data - String based to match legacy
    userId: { type: String, required: true },
    userName: { type: String },
    userInitial: { type: String },
    contactName: { type: String },
    contactPhone: { type: String }, // Legacy field name matches

    images: { type: [String], default: [] },

    // Details
    imei: { type: String },
    serialNumber: { type: String },
    idNumber: { type: String },
    color: { type: String },

    isLost: { type: Boolean, required: true },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Post = mongoose.model<IPost>("Post", postSchema);
