import Link from "next/link";
import { PageHeader, StatCard } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { dashboardStats, listGroups } from "@/lib/data";

export default async function TeacherDashboardPage() {
  const user = await requireTeacher();
  const stats = await dashboardStats();
  const open = await listGroups({ openOnly: true, page: 1 });
  const all = await listGroups({ page: 1 });
  const full = all.items.filter((group) => group.status === "FULL");

  return (
    <div>
      <PageHeader
        kicker={user.staffRole === "admin" ? "Administrator" : "Teacher"}
        title={`Hello, ${user.fullName.split(" ")[0]}.`}
        description="Monitor group capacity, assign supervisors, and keep project titles current."
      />
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Students" value={stats.students} />
        <StatCard label="Teachers" value={stats.teachers} />
        <StatCard label="Groups" value={stats.groups} />
        <StatCard label="Open" value={stats.openGroups} />
        <StatCard label="Full" value={stats.fullGroups} />
        <StatCard label="Pending joins" value={stats.pendingRequests} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-[#12324d]">Groups needing members</h2>
            <Link className="text-sm font-semibold text-teal-800" href="/teacher/groups?open=1">
              View all
            </Link>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {open.items.slice(0, 5).map((group) => (
              <li key={group.id} className="flex items-center justify-between rounded-xl bg-[#f6f1e7] px-3 py-2">
                <span>{group.name}</span>
                <span>{group.availableSeats} seats</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="font-display text-2xl text-[#12324d]">Full groups</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {full.length === 0 ? <li>No full groups on this page.</li> : null}
            {full.map((group) => (
              <li key={group.id} className="flex items-center justify-between rounded-xl bg-[#f6f1e7] px-3 py-2">
                <span>{group.name}</span>
                <span>6/6</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
