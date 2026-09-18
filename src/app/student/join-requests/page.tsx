import Link from "next/link";
import { acceptRequest, rejectRequest } from "@/app/actions/requests";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { getGroupDetail, listLeaderRequests } from "@/lib/data";

export default async function LeaderJoinRequestsPage() {
  const user = await requireStudent();
  if (!user.isLeader || !user.groupId) {
    return (
      <div>
        <PageHeader title="Join requests" />
        <EmptyState title="Leaders only" text="Create a group to review incoming join requests." />
      </div>
    );
  }

  const group = await getGroupDetail(user.groupId);
  const requests = await listLeaderRequests(user.groupId);
  const pending = requests.filter((row) => row.status === "PENDING");

  return (
    <div>
      <PageHeader
        kicker="Leader inbox"
        title="Join requests"
        description={`${group?.name ?? "Your group"} has ${group?.availableSeats ?? 0} seats left. Accepting a member uses a database transaction so the group cannot go over 6.`}
      />

      {pending.length === 0 ? (
        <EmptyState title="No pending requests" text="When students apply, they will appear here." />
      ) : (
        <div className="grid gap-4">
          {pending.map((request) => (
            <article key={request.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl text-[#12324d]">{request.fullName}</h2>
                  <p className="text-sm text-[#6b6256]">
                    {request.rollNumber} · {request.department} · {request.email}
                  </p>
                  <p className="mt-3 text-sm">{request.note || "No note attached."}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={acceptRequest}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <button className="btn btn-teal" type="submit">
                    Accept
                  </button>
                </form>
                <form action={rejectRequest}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <button className="btn btn-danger" type="submit">
                    Reject
                  </button>
                </form>
                <Link className="btn btn-ghost" href={`/student/messages/student/${request.studentId}`}>
                  Message applicant
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="card mt-6 p-5">
        <h2 className="font-display text-2xl text-[#12324d]">Request history</h2>
        <div className="table-wrap mt-3">
          <table className="data">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.fullName}</td>
                  <td>{request.rollNumber}</td>
                  <td>
                    <StatusBadge status={request.status} />
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
