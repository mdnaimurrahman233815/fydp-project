import Link from "next/link";
import { leaderRemoveMember } from "@/app/actions/groups";
import { LeaderGroupForm } from "@/components/Forms";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { getGroupDetail } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function MyGroupPage() {
  const user = await requireStudent();
  if (!user.groupId) {
    return (
      <div>
        <PageHeader kicker="My group" title="You are not in a group yet" />
        <EmptyState title="No membership" text="Browse OPEN groups or create a team to become the leader." />
        <div className="mt-4 flex gap-2">
          <Link className="btn btn-primary" href="/student/groups">
            Browse groups
          </Link>
          <Link className="btn btn-ghost" href="/student/groups/create">
            Create group
          </Link>
        </div>
      </div>
    );
  }

  const group = await getGroupDetail(user.groupId);
  if (!group) {
    return <EmptyState title="Group missing" text="Your group record could not be loaded." />;
  }

  return (
    <div>
      <PageHeader
        kicker={user.isLeader ? "Leader tools" : "Membership"}
        title={group.name}
        description={`${group.projectTitle} · ${group.memberCount}/6 members`}
        actions={<StatusBadge status={group.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-2xl text-[#12324d]">Project info</h2>
          <p className="mt-3 text-sm">{group.projectDescription || "No summary yet."}</p>
          <p className="mt-3 text-sm">Supervisor: {group.supervisorName ?? "Unassigned"}</p>
          <p className="mt-1 text-sm">Leader: {group.leaderName}</p>
          {user.isLeader ? (
            <Link className="btn btn-ghost mt-4" href="/student/join-requests">
              Review join requests
            </Link>
          ) : null}
        </section>

        {user.isLeader ? (
          <section className="card p-5">
            <h2 className="font-display text-2xl text-[#12324d]">Edit group</h2>
            <div className="mt-3">
              <LeaderGroupForm
                name={group.name}
                description={group.description ?? ""}
                projectTitle={group.projectTitle}
                projectDescription={group.projectDescription ?? ""}
              />
            </div>
          </section>
        ) : (
          <section className="card p-5">
            <h2 className="font-display text-2xl text-[#12324d]">Need something?</h2>
            <p className="mt-3 text-sm text-[#5d564b]">Message your leader or supervisor from the members table or inbox.</p>
          </section>
        )}
      </div>

      <section className="card mt-5 p-5">
        <h2 className="font-display text-2xl text-[#12324d]">Members</h2>
        <div className="table-wrap mt-3">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll no.</th>
                <th>Email</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {group.members.map((member) => (
                <tr key={member.id}>
                  <td>
                    {member.fullName}
                    {member.id === group.leaderStudentId ? " · Leader" : ""}
                  </td>
                  <td>{member.rollNumber}</td>
                  <td>{member.email}</td>
                  <td>{formatDate(member.joinedAt)}</td>
                  <td className="flex gap-3">
                    {member.id !== user.id ? (
                      <Link className="text-sm font-semibold text-teal-800" href={`/student/messages/student/${member.id}`}>
                        Message
                      </Link>
                    ) : null}
                    {user.isLeader && member.id !== user.id ? (
                      <form action={leaderRemoveMember}>
                        <input type="hidden" name="studentId" value={member.id} />
                        <button className="text-sm font-semibold text-red-800" type="submit">
                          Remove
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
