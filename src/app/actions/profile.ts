"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { students, teachers } from "@/db/schema";
import { getSession } from "@/lib/auth";
import type { ActionState } from "@/lib/utils";

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in first." };

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "Passwords do not match." };

  if (session.kind === "student") {
    const [row] = await db.select().from(students).where(eq(students.id, session.id)).limit(1);
    if (!row) return { error: "Account not found." };
    const ok = await bcrypt.compare(current, row.passwordHash);
    if (!ok) return { error: "Current password is incorrect." };
    await db
      .update(students)
      .set({ passwordHash: await bcrypt.hash(next, 10) })
      .where(eq(students.id, session.id));
    revalidatePath("/student/profile");
  } else {
    const [row] = await db.select().from(teachers).where(eq(teachers.id, session.id)).limit(1);
    if (!row) return { error: "Account not found." };
    const ok = await bcrypt.compare(current, row.passwordHash);
    if (!ok) return { error: "Current password is incorrect." };
    await db
      .update(teachers)
      .set({ passwordHash: await bcrypt.hash(next, 10) })
      .where(eq(teachers.id, session.id));
    revalidatePath("/teacher/profile");
  }

  return { success: "Password updated." };
}
