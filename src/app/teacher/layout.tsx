import type { ReactNode } from "react";
import { AppNav, Footer } from "@/components/Navbar";
import { requireTeacher } from "@/lib/auth";
import { countUnread } from "@/lib/data";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const user = await requireTeacher();
  const unread = await countUnread("teacher", user.id);

  return (
    <div className="min-h-screen">
      <AppNav user={user} unread={unread} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
