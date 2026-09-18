import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/auth";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#12324d]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3 text-white">
          <img src="/images/logo.png" alt="FYDP Hub logo" className="h-10 w-10 rounded-full bg-white object-cover" />
          <span>
            <span className="block font-display text-lg leading-none">FYDP Hub</span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#e8dfd0]">Project Office</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link className="nav-link hidden sm:inline" href="/#how">
            How it works
          </Link>
          <Link className="nav-link hidden sm:inline" href="/guide">
            Guide
          </Link>
          <Link className="nav-link" href="/login/student">
            Student login
          </Link>
          <Link className="nav-link" href="/login/teacher">
            Staff login
          </Link>
          <Link className="btn btn-gold" href="/register">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function AppNav({
  user,
  unread,
  pending,
}: {
  user: SessionUser;
  unread: number;
  pending?: number;
}) {
  const studentLinks =
    user.kind === "student"
      ? [
          { href: "/student/dashboard", label: "Dashboard" },
          { href: "/student/groups", label: "Browse groups" },
          ...(!user.groupId ? [{ href: "/student/groups/create", label: "Create group" }] : []),
          ...(user.groupId ? [{ href: "/student/my-group", label: "My group" }] : []),
          { href: "/student/requests", label: "My requests" },
          ...(user.isLeader
            ? [{ href: "/student/join-requests", label: "Join requests", badge: pending ?? 0 }]
            : []),
          { href: "/student/messages", label: "Messages", badge: unread },
          { href: "/student/profile", label: "Profile" },
        ]
      : [
          { href: "/teacher/dashboard", label: "Dashboard" },
          { href: "/teacher/students", label: "Students" },
          { href: "/teacher/groups", label: "Groups" },
          { href: "/teacher/supervisors", label: "Supervisors" },
          { href: "/teacher/messages", label: "Messages", badge: unread },
          { href: "/teacher/profile", label: "Profile" },
        ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#12324d]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link href={user.kind === "student" ? "/student/dashboard" : "/teacher/dashboard"} className="flex items-center gap-3 text-white">
            <img src="/images/logo.png" alt="FYDP Hub logo" className="h-10 w-10 rounded-full bg-white object-cover" />
            <span>
              <span className="block font-display text-lg leading-none">FYDP Hub</span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-[#e8dfd0]">
                {user.kind === "student" ? (user.isLeader ? "Team leader" : "Student") : user.staffRole === "admin" ? "Administrator" : "Teacher"}
              </span>
            </span>
          </Link>
          <form action={logout} className="lg:hidden">
            <button className="btn btn-gold px-3 py-1.5 text-xs" type="submit">
              Logout
            </button>
          </form>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {studentLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link inline-flex items-center gap-1">
              {link.label}
              {"badge" in link && (link.badge ?? 0) > 0 ? (
                <span className="rounded-full bg-[#c4a35a] px-1.5 text-[10px] font-bold text-[#12324d]">{link.badge}</span>
              ) : null}
            </Link>
          ))}
          <form action={logout} className="hidden lg:block">
            <button className="btn btn-gold ml-2 px-3 py-1.5 text-xs" type="submit">
              Logout
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-10 border-t border-[#e4d9c5] px-4 py-8 text-sm text-[#6b6256]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>FYDP Hub · Final Year Design Project Office</p>
        <p>Max group size 6 · One group per student</p>
      </div>
    </footer>
  );
}
