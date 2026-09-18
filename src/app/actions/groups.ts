"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { actionLogs, groupMembers, groups, joinRequests, projects, teachers } from "@/db/schema";
import { requireStudent, requireTeacher } from "@/lib/auth";
import { MAX_GROUP_SIZE } from "@/lib/constants";
import type { ActionState } from "@/lib/utils";

export async function createGroup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStudent();
  if (user.groupId) return { error: "You already belong to a group." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const projectTitle = String(formData.get("projectTitle") ?? "").trim();
  const projectDescription = String(formData.get("projectDescription") ?? "").trim();
  const supervisorRaw = String(formData.get("supervisorId") ?? "").trim();

  if (name.length < 3) return { error: "Group name must be at least 3 characters." };

  let supervisorId: number | null = null;
  if (supervisorRaw) {
    const parsed = Number(supervisorRaw);
    if (!Number.isInteger(parsed)) return { error: "Invalid supervisor." };
    const [teacher] = await db.select({ id: teachers.id }).from(teachers).where(eq(teachers.id, parsed)).limit(1);
    if (!teacher) return { error: "Supervisor not found." };
    supervisorId = teacher.id;
  }

  const created = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(eq(groupMembers.studentId, user.id))
      .limit(1);
    if (existing) return null;

    const [groupRes] = await tx
      .insert(groups)
      .values({
        name,
        description: description || null,
        leaderStudentId: user.id,
        isActive: true,
      })
      .$returningId();
      
    if (!groupRes) return null;

    await tx.insert(groupMembers).values({ groupId: groupRes.id, studentId: user.id });
    await tx.insert(projects).values({
      groupId: groupRes.id,
      title: projectTitle || "Untitled project",
      description: projectDescription || null,
      supervisorTeacherId: supervisorId,
    });
    return groupRes;
  });

  if (!created) return { error: "You already belong to a group." };

  revalidatePath("/student");
  redirect("/student/my-group");
}

export async function updateGroupInfo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStudent();
  if (!user.isLeader || !user.groupId) return { error: "Only the group leader can update this." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const projectTitle = String(formData.get("projectTitle") ?? "").trim();
  const projectDescription = String(formData.get("projectDescription") ?? "").trim();

  if (name.length < 3) return { error: "Group name must be at least 3 characters." };

  await db.update(groups).set({ name, description: description || null }).where(eq(groups.id, user.groupId));
  await db
    .update(projects)
    .set({
      title: projectTitle || "Untitled project",
      description: projectDescription || null,
      updatedAt: new Date(),
    })
    .where(eq(projects.groupId, user.groupId));

  revalidatePath("/student/my-group");
  return { success: "Group details updated." };
}

export async function requestToJoin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireStudent();
  const groupId = Number(formData.get("groupId"));
  const note = String(formData.get("note") ?? "").trim();

  if (!Number.isInteger(groupId)) return { error: "Invalid group." };
  if (user.groupId) return { error: "You already belong to a group." };

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  if (!group || !group.isActive) return { error: "This group is not accepting members." };

  const [countRow] = await db
    .select({ total: count() })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));
  if ((countRow?.total ?? 0) >= MAX_GROUP_SIZE) return { error: "This group is FULL." };

  const [pending] = await db
    .select()
    .from(joinRequests)
    .where(
      and(eq(joinRequests.groupId, groupId), eq(joinRequests.studentId, user.id), eq(joinRequests.status, "PENDING")),
    )
    .limit(1);
  if (pending) return { error: "You already have a pending request for this group." };

  await db.insert(joinRequests).values({
    groupId,
    studentId: user.id,
    status: "PENDING",
    note: note || null,
  });

  revalidatePath(`/student/groups/${groupId}`);
  revalidatePath("/student/requests");
  redirect("/student/requests?success=Request%20sent");
}

export async function cancelRequest(formData: FormData) {
  const user = await requireStudent();
  const requestId = Number(formData.get("requestId"));
  if (!Number.isInteger(requestId)) return;

  await db
    .update(joinRequests)
    .set({ status: "CANCELLED", updatedAt: new Date() })
    .where(
      and(eq(joinRequests.id, requestId), eq(joinRequests.studentId, user.id), eq(joinRequests.status, "PENDING")),
    );

  revalidatePath("/student/requests");
}

export async function leaderRemoveMember(formData: FormData) {
  const user = await requireStudent();
  if (!user.isLeader || !user.groupId) return;
  const studentId = Number(formData.get("studentId"));
  if (!Number.isInteger(studentId) || studentId === user.id) return;

  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, user.groupId), eq(groupMembers.studentId, studentId)));

  revalidatePath("/student/my-group");
}

export async function teacherUpdateProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireTeacher();
  const groupId = Number(formData.get("groupId"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const supervisorRaw = String(formData.get("supervisorId") ?? "").trim();

  if (!Number.isInteger(groupId)) return { error: "Invalid group." };
  if (!title) return { error: "Project title is required." };

  let supervisorId: number | null = null;
  if (supervisorRaw) {
    const parsed = Number(supervisorRaw);
    const [teacher] = await db.select({ id: teachers.id }).from(teachers).where(eq(teachers.id, parsed)).limit(1);
    if (!teacher) return { error: "Supervisor not found." };
    supervisorId = teacher.id;
  }

  await db
    .update(projects)
    .set({
      title,
      description: description || null,
      supervisorTeacherId: supervisorId,
      updatedAt: new Date(),
    })
    .where(eq(projects.groupId, groupId));

  revalidatePath(`/teacher/groups/${groupId}`);
  revalidatePath("/teacher/groups");
  return { success: "Project information saved." };
}

export async function teacherToggleGroup(formData: FormData) {
  const user = await requireTeacher();
  if (user.staffRole !== "admin") return;
  const groupId = Number(formData.get("groupId"));
  const next = String(formData.get("next")) === "1";
  if (!Number.isInteger(groupId)) return;

  await db.update(groups).set({ isActive: next }).where(eq(groups.id, groupId));
  await db.insert(actionLogs).values({
    actorId: user.id,
    actorRole: "teacher",
    action: next ? "activate_group" : "deactivate_group",
    details: `Group ${groupId} set active=${next}`,
  });
  revalidatePath(`/teacher/groups/${groupId}`);
}

export async function teacherRemoveMember(formData: FormData) {
  const user = await requireTeacher();
  if (user.staffRole !== "admin") return;
  const groupId = Number(formData.get("groupId"));
  const studentId = Number(formData.get("studentId"));
  if (!Number.isInteger(groupId) || !Number.isInteger(studentId)) return;

  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  if (!group || group.leaderStudentId === studentId) return;

  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.studentId, studentId)));
  await db.insert(actionLogs).values({
    actorId: user.id,
    actorRole: "teacher",
    action: "remove_member",
    details: `Removed student ${studentId} from group ${groupId}`,
  });
  revalidatePath(`/teacher/groups/${groupId}`);
}