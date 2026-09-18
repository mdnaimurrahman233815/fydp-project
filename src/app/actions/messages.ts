"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { getSession } from "@/lib/auth";
import type { ActionState } from "@/lib/utils";

export async function sendMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in first." };

  const composeTarget = String(formData.get("composeTarget") ?? "");
  let receiverRole = String(formData.get("receiverRole") ?? "");
  let receiverId = Number(formData.get("receiverId"));
  const content = String(formData.get("content") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "");

  if (composeTarget.includes(":")) {
    const [role, id] = composeTarget.split(":");
    receiverRole = role ?? "";
    receiverId = Number(id);
  }

  if (receiverRole !== "student" && receiverRole !== "teacher") {
    return { error: "Select a valid recipient." };
  }
  if (!Number.isInteger(receiverId)) return { error: "Select a valid recipient." };
  if (content.length < 1) return { error: "Message cannot be empty." };
  if (content.length > 2000) return { error: "Message is too long." };
  if (session.kind === receiverRole && session.id === receiverId) {
    return { error: "You cannot message yourself." };
  }

  await db.insert(messages).values({
    senderId: session.id,
    senderRole: session.kind,
    receiverId,
    receiverRole,
    content,
    isRead: false,
  });

  const base = session.kind === "student" ? "/student/messages" : "/teacher/messages";
  revalidatePath(base);
  redirect(returnTo || `${base}/${receiverRole}/${receiverId}`);
}
