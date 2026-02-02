"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const checkUser = async () => {
  const user = await currentUser();

  // 1. Check if Clerk user exists
  if (!user) return null;

  // 2. Check if user is already in our Neon DB
  const loggedInUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  if (loggedInUser) return loggedInUser;

  // 3. If not, create new user in DB
  const newUser = await db.insert(users).values({
    clerkId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    imageUrl: user.imageUrl,
    email: user.emailAddresses[0].emailAddress,
  }).returning();

  return newUser[0];
};