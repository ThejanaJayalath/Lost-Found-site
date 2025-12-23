/**
 * Script to create an owner user
 * Run this once to create your owner account:
 * node -r ts-node/register scripts/createOwnerUser.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";
import { env } from "../src/config/env";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "thejanashehan.com@gmail.com";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "Thejana321@";
const OWNER_NAME = process.env.OWNER_NAME || "Owner";

async function createOwnerUser() {
  try {
    // Connect to database
    await mongoose.connect(env.mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if owner user already exists
    const existingOwner = await User.findOne({ email: OWNER_EMAIL });

    if (existingOwner) {
      // Update existing user to be owner
      const hashedPassword = await bcrypt.hash(OWNER_PASSWORD, 10);
      existingOwner.passwordHash = hashedPassword;
      existingOwner.roles = ["OWNER", "ADMIN", "USER"];
      await existingOwner.save();
      console.log("✅ Updated existing user to owner:", OWNER_EMAIL);
    } else {
      // Create new owner user
      const hashedPassword = await bcrypt.hash(OWNER_PASSWORD, 10);
      const ownerUser = new User({
        email: OWNER_EMAIL,
        passwordHash: hashedPassword,
        fullName: OWNER_NAME,
        roles: ["OWNER", "ADMIN", "USER"],
        blocked: false,
      });

      await ownerUser.save();
      console.log("✅ Created owner user:", OWNER_EMAIL);
    }

    console.log("\n📝 Owner Credentials:");
    console.log("   Email:", OWNER_EMAIL);
    console.log("   Password:", OWNER_PASSWORD);
    console.log("\n⚠️  Please change the default password after first login!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating owner user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createOwnerUser();

