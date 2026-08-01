import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { env } from "../config/env.js";
import { Admin } from "../models/admin.js";
import { hashPassword } from "../utils/password.js";

const values = [env.ADMIN_USERNAME, env.ADMIN_FULL_NAME, env.ADMIN_EMAIL, env.ADMIN_PASSWORD];
if (values.some((value) => !value)) {
  throw new Error(
    "ADMIN_USERNAME, ADMIN_FULL_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required to seed an admin",
  );
}

await connectDatabase();
try {
  const [username, fullName, email, password] = values as [string, string, string, string];
  const admin = await Admin.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      username: username.toLowerCase(),
      fullName,
      email: email.toLowerCase(),
      password: await hashPassword(password),
    },
    { upsert: true, new: true, runValidators: true },
  );
  console.log(`Administrator ${admin.email} is ready`);
} finally {
  await disconnectDatabase();
}
