import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { groupMembers, groups, sessions, students, teachers } from "@/db/schema";
import { SESSION_COOKIE, SESSION_DAYS } from "./constants";

export type StudentSession = {
  kind: "student";
  id: number;
  fullName: string;
  email: string;
  rollNumber: string;
  department: string;
  isLeader: boolean;
  groupId: number | null;
  groupName: string | null;
};

export type TeacherSession = {
  kind: "teacher";
  id: number;
  fullName: string;
  email: string;
  department: string;
  staffRole: "teacher" | "admin";
};

export type SessionUser = StudentSession | TeacherSession;

export async function createSession(userId: number, role: "student" | "teacher") {
  await db.delete(sessions).where(and(eq(sessions.userId, userId), eq(sessions.role, role)));

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({ userId, role, token, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!row) return null;

  if (row.role === "student") {
    const [student] = await db.select().from(students).where(eq(students.id, row.userId)).limit(1);
    if (!student) return null;

    const [membership] = await db
      .select({
        groupId: groupMembers.groupId,
        groupName: groups.name,
        leaderStudentId: groups.leaderStudentId,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.studentId, student.id))
      .limit(1);

    return {
      kind: "student",
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      rollNumber: student.rollNumber,
      department: student.department,
      isLeader: membership ? membership.leaderStudentId === student.id : false,
      groupId: membership?.groupId ?? null,
      groupName: membership?.groupName ?? null,
    };
  }

  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, row.userId)).limit(1);
  if (!teacher) return null;

  return {
    kind: "teacher",
    id: teacher.id,
    fullName: teacher.fullName,
    email: teacher.email,
    department: teacher.department,
    staffRole: teacher.role === "admin" ? "admin" : "teacher",
  };
}

export async function requireStudent(): Promise<StudentSession> {
  const session = await getSession();
  if (!session) redirect("/login/student");
  if (session.kind !== "student") redirect("/teacher/dashboard");
  return session;
}

export async function requireTeacher(): Promise<TeacherSession> {
  const session = await getSession();
  if (!session) redirect("/login/teacher");
  if (session.kind !== "teacher") redirect("/student/dashboard");
  return session;
}

export async function requireAdmin(): Promise<TeacherSession> {
  const session = await requireTeacher();
  if (session.staffRole !== "admin") redirect("/teacher/dashboard");
  return session;
}
