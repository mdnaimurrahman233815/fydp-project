import type { ReactNode } from "react";
import { AppNav, Footer } from "@/components/Navbar";
import { requireStudent } from "@/lib/auth";
import { countPendingForGroup, countUnread } from "@/lib/data";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const user = await requireStudent();
  const unread = await countUnread("student", user.id);
  const pending = user.isLeader && user.groupId ? await countPendingForGroup(user.groupId) : 0;

  return (
    <div className="min-h-screen">
      <AppNav user={user} unread={unread} pending={pending} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
