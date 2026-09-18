import Link from "next/link";
import { PageHeader, StatCard, StatusBadge } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { studentDashboardData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const user = await requireStudent();
  const data = await studentDashboardData(user);

  return (
    <div>
      <PageHeader
        kicker={user.isLeader ? "Team leader desk" : "Student desk"}
        title={`Welcome, ${user.fullName.split(" ")[0]}.`}
        description={
          user.groupName
            ? `You are ${user.isLeader ? "leading" : "a member of"} ${user.groupName}.`
            : "You are not in a group yet. Browse open teams or create your own."
        }
        actions={
          user.groupId ? (
            <Link className="btn btn-primary" href="/student/my-group">
              Open my group
            </Link>
          ) : (
            <>
              <Link className="btn btn-primary" href="/student/groups">
                Browse groups
              </Link>
              <Link className="btn btn-ghost" href="/student/groups/create">
                Create a group
              </Link>
            </>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="My group" value={user.groupName ?? "None"} hint={user.isLeader ? "You are the leader" : "Membership"} />
        <StatCard label="Unread messages" value={data.unread} />
        <StatCard label="My pending requests" value={data.pendingMine} />
        <StatCard label="Incoming requests" value={data.pendingIncoming} hint={user.isLeader ? "Waiting for you" : "Leaders only"} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-2xl text-[#12324d]">Group snapshot</h2>
          {data.group ? (
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center justify-between">
                <span>Status</span>
                <StatusBadge status={data.group.status} />
              </p>
              <p>Project: {data.group.projectTitle}</p>
              <p>Supervisor: {data.group.supervisorName ?? "Unassigned"}</p>
              <p>
                Members: {data.group.memberCount}/6 · Seats left: {data.group.availableSeats}
              </p>
              <Link className="btn btn-ghost mt-3" href="/student/my-group">
                Manage / view group
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#6b6256]">Join an OPEN group or start one to become team leader.</p>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-[#12324d]">Recent requests</h2>
            <Link className="text-sm font-semibold text-teal-800" href="/student/requests">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {data.myRequests.length === 0 ? (
              <p className="text-sm text-[#6b6256]">No join requests yet.</p>
            ) : (
              data.myRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between rounded-xl bg-[#f6f1e7] px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{request.groupName}</p>
                    <p className="text-xs text-[#6b6256]">{formatDate(request.createdAt)}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
