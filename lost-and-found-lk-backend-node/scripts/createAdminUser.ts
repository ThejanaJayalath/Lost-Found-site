/**
 * Script to create an admin user
 * Run this once to create your admin account:
 * npx ts-node scripts/createAdminUser.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";
import { env } from "../src/config/env";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@traceback.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Thejanaadmin2003@";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

async function createAdminUser() {
  try {
    // Connect to database
    await mongoose.connect(env.mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      // Update existing user to be admin
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      existingAdmin.passwordHash = hashedPassword;
      existingAdmin.roles = ["ADMIN", "USER"];
      await existingAdmin.save();
      console.log("✅ Updated existing user to admin:", ADMIN_EMAIL);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const adminUser = new User({
        email: ADMIN_EMAIL,
        passwordHash: hashedPassword,
        fullName: ADMIN_NAME,
        roles: ["ADMIN", "USER"],
        blocked: false,
      });

      await adminUser.save();
      console.log("✅ Created admin user:", ADMIN_EMAIL);
    }

    console.log("\n📝 Admin Credentials:");
    console.log("   Email:", ADMIN_EMAIL);
    console.log("   Password:", ADMIN_PASSWORD);
    console.log("\n⚠️  Please change the default password after first login!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdminUser();

