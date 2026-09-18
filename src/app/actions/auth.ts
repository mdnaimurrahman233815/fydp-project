"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { students, teachers } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth";
import { DEPARTMENTS } from "@/lib/constants";
import { isValidEmail, type ActionState } from "@/lib/utils";

export async function registerStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rollNumber = String(formData.get("rollNumber") ?? "").trim().toUpperCase();
  const department = String(formData.get("department") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (fullName.length < 3) return { error: "Please enter your full name." };
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };
  if (rollNumber.length < 4) return { error: "Enter a valid roll number." };
  if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
    return { error: "Select a valid department." };
  }
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const [emailExists] = await db.select({ id: students.id }).from(students).where(eq(students.email, email)).limit(1);
  if (emailExists) return { error: "That email is already registered." };

  const [rollExists] = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.rollNumber, rollNumber))
    .limit(1);
  if (rollExists) return { error: "That roll number is already registered." };

  const passwordHash = await bcrypt.hash(password, 10);
  const [created] = await db
    .insert(students)
    .values({ fullName, email, rollNumber, department, passwordHash })
    .$returningId();

  if (!created) return { error: "Could not create account." };
  await createSession(created.id, "student");
  redirect("/student/dashboard");
}

export async function loginStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const [student] = await db.select().from(students).where(eq(students.email, email)).limit(1);
  if (!student) return { error: "Invalid email or password." };

  const ok = await bcrypt.compare(password, student.passwordHash);
  if (!ok) return { error: "Invalid email or password." };

  await createSession(student.id, "student");
  redirect("/student/dashboard");
}

export async function loginTeacher(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const [teacher] = await db.select().from(teachers).where(eq(teachers.email, email)).limit(1);
  if (!teacher) return { error: "Invalid email or password." };

  const ok = await bcrypt.compare(password, teacher.passwordHash);
  if (!ok) return { error: "Invalid email or password." };

  await createSession(teacher.id, "teacher");
  redirect("/teacher/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}