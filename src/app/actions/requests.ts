"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { groupMembers, groups, joinRequests } from "@/db/schema";
import { requireStudent } from "@/lib/auth";
import { MAX_GROUP_SIZE } from "@/lib/constants";

export async function acceptRequest(formData: FormData) {
  const user = await requireStudent();
  if (!user.isLeader || !user.groupId) return;

  const requestId = Number(formData.get("requestId"));
  if (!Number.isInteger(requestId)) return;

  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`select id from groups where id = ${user.groupId} for update`);

      const [group] = await tx.select().from(groups).where(eq(groups.id, user.groupId!)).limit(1);
      if (!group || !group.isActive || group.leaderStudentId !== user.id) {
        throw new Error("Not allowed.");
      }

      const [request] = await tx.select().from(joinRequests).where(eq(joinRequests.id, requestId)).limit(1);
      if (!request || request.groupId !== user.groupId || request.status !== "PENDING") {
        throw new Error("Request is no longer pending.");
      }

      const [countRow] = await tx
        .select({ total: sql<number>`cast(count(*) as int)` })
        .from(groupMembers)
        .where(eq(groupMembers.groupId, user.groupId!));
      if ((countRow?.total ?? 0) >= MAX_GROUP_SIZE) {
        throw new Error("Group is already full.");
      }

      const [existing] = await tx
        .select()
        .from(groupMembers)
        .where(eq(groupMembers.studentId, request.studentId))
        .limit(1);
      if (existing) {
        throw new Error("Student already belongs to a group.");
      }

      await tx.insert(groupMembers).values({
        groupId: user.groupId!,
        studentId: request.studentId,
      });

      await tx
        .update(joinRequests)
        .set({ status: "ACCEPTED", updatedAt: new Date() })
        .where(eq(joinRequests.id, request.id));

      await tx
        .update(joinRequests)
        .set({ status: "REJECTED", updatedAt: new Date() })
        .where(
          and(
            eq(joinRequests.studentId, request.studentId),
            eq(joinRequests.status, "PENDING"),
            ne(joinRequests.id, request.id),
          ),
        );
    });
  } catch {
    // Surface via revalidation; leader page will show remaining pending/full state.
  }

  revalidatePath("/student/join-requests");
  revalidatePath("/student/my-group");
  revalidatePath("/student/dashboard");
}

export async function rejectRequest(formData: FormData) {
  const user = await requireStudent();
  if (!user.isLeader || !user.groupId) return;

  const requestId = Number(formData.get("requestId"));
  if (!Number.isInteger(requestId)) return;

  await db
    .update(joinRequests)
    .set({ status: "REJECTED", updatedAt: new Date() })
    .where(
      and(eq(joinRequests.id, requestId), eq(joinRequests.groupId, user.groupId), eq(joinRequests.status, "PENDING")),
    );

  revalidatePath("/student/join-requests");
}
