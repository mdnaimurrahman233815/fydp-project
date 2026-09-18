import Link from "next/link";
import { notFound } from "next/navigation";
import { teacherRemoveMember, teacherToggleGroup } from "@/app/actions/groups";
import { TeacherProjectForm } from "@/components/Forms";
import { PageHeader, StatusBadge } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { getGroupDetail, listSupervisors } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function TeacherGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireTeacher();
  const { id } = await params;
  const groupId = Number(id);
  if (!Number.isInteger(groupId)) notFound();
  const group = await getGroupDetail(groupId);
  if (!group) notFound();
  const teachers = await listSupervisors();

  return (
    <div>
      <PageHeader
        kicker={`Group #${group.id}`}
        title={group.name}
        description={group.description || "No description"}
        actions={<StatusBadge status={group.status} />}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-2xl text-[#12324d]">Project & supervisor</h2>
          <div className="mt-3">
            <TeacherProjectForm
              groupId={group.id}
              title={group.projectTitle}
              description={group.projectDescription ?? ""}
              supervisorId={group.supervisorId}
              teachers={teachers}
            />
          </div>
        </section>
        <section className="card p-5">
          <h2 className="font-display text-2xl text-[#12324d]">Capacity</h2>
          <p className="mt-3 text-sm">{group.memberCount}/6 members · {group.availableSeats} seats left</p>
          <p className="mt-2 text-sm">Leader: {group.leaderName} ({group.leaderRoll})</p>
          {group.leaderStudentId ? (
            <Link className="btn btn-ghost mt-4" href={`/teacher/messages/student/${group.leaderStudentId}`}>
              Message leader
            </Link>
          ) : null}
          {user.staffRole === "admin" ? (
            <form action={teacherToggleGroup} className="mt-4">
              <input type="hidden" name="groupId" value={group.id} />
              <input type="hidden" name="next" value={group.isActive ? "0" : "1"} />
              <button className={group.isActive ? "btn btn-danger" : "btn btn-teal"} type="submit">
                {group.isActive ? "Deactivate group" : "Reactivate group"}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-xs text-[#7a7164]">Only administrators can deactivate a group or remove members.</p>
          )}
        </section>
      </div>

      <section className="card mt-5 p-5">
        <h2 className="font-display text-2xl text-[#12324d]">Members</h2>
        <div className="table-wrap mt-3">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll</th>
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
                    <Link className="text-sm font-semibold text-teal-800" href={`/teacher/messages/student/${member.id}`}>
                      Message
                    </Link>
                    {user.staffRole === "admin" && member.id !== group.leaderStudentId ? (
                      <form action={teacherRemoveMember}>
                        <input type="hidden" name="groupId" value={group.id} />
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
