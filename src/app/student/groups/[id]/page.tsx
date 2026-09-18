import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinForm } from "@/components/Forms";
import { PageHeader, StatusBadge } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { getGroupDetail, getPendingRequest } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStudent();
  const { id } = await params;
  const groupId = Number(id);
  if (!Number.isInteger(groupId)) notFound();
  const group = await getGroupDetail(groupId);
  if (!group) notFound();

  const pending = !user.groupId ? await getPendingRequest(user.id, groupId) : null;
  const canJoin = !user.groupId && group.status === "OPEN" && !pending;

  return (
    <div>
      <PageHeader
        kicker={`Group #${group.id}`}
        title={group.name}
        description={group.description || "No description yet."}
        actions={<StatusBadge status={group.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-5">
          <h2 className="font-display text-2xl text-[#12324d]">Project</h2>
          <p className="mt-2 font-medium">{group.projectTitle}</p>
          <p className="mt-2 text-sm text-[#5d564b]">{group.projectDescription || "No project summary yet."}</p>
          <div className="mt-4 grid gap-2 text-sm">
            <p>Supervisor: {group.supervisorName ?? "Unassigned"}</p>
            {group.supervisorEmail ? <p>Supervisor email: {group.supervisorEmail}</p> : null}
            <p>
              Leader: {group.leaderName} ({group.leaderRoll})
            </p>
            <p>
              Members {group.memberCount}/6 · {group.availableSeats} seats available
            </p>
          </div>
          {group.supervisorId ? (
            <Link className="btn btn-ghost mt-4" href={`/student/messages/teacher/${group.supervisorId}`}>
              Message supervisor
            </Link>
          ) : null}
          {group.leaderStudentId !== user.id ? (
            <Link className="btn btn-ghost mt-4 ml-2" href={`/student/messages/student/${group.leaderStudentId}`}>
              Message leader
            </Link>
          ) : null}
        </section>

        <section className="card p-5">
          <h2 className="font-display text-2xl text-[#12324d]">Join this group</h2>
          {user.groupId === group.id ? (
            <p className="mt-3 text-sm">You already belong to this group.</p>
          ) : user.groupId ? (
            <p className="mt-3 text-sm">You already belong to another group, so you cannot join this one.</p>
          ) : pending ? (
            <p className="mt-3 text-sm">Your request is <strong>PENDING</strong>. You can cancel it from My requests.</p>
          ) : group.status !== "OPEN" ? (
            <p className="mt-3 text-sm">This group is {group.status} and cannot accept new requests.</p>
          ) : canJoin ? (
            <div className="mt-3">
              <JoinForm groupId={group.id} />
            </div>
          ) : null}
        </section>
      </div>

      <section className="card mt-5 p-5">
        <h2 className="font-display text-2xl text-[#12324d]">Members</h2>
        <div className="table-wrap mt-3">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll no.</th>
                <th>Department</th>
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
                  <td>{member.department}</td>
                  <td>{formatDate(member.joinedAt)}</td>
                  <td>
                    {member.id !== user.id ? (
                      <Link className="text-sm font-semibold text-teal-800" href={`/student/messages/student/${member.id}`}>
                        Message
                      </Link>
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
