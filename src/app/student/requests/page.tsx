import { cancelRequest } from "@/app/actions/groups";
import { Alert, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { listStudentRequests } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function StudentRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await requireStudent();
  const params = await searchParams;
  const requests = await listStudentRequests(user.id);

  return (
    <div>
      <PageHeader
        kicker="Applications"
        title="My join requests"
        description="Track PENDING, ACCEPTED, REJECTED, or CANCELLED requests. You may cancel a request while it is still pending."
      />
      {params.success ? <Alert type="success">{params.success}</Alert> : null}

      {requests.length === 0 ? (
        <EmptyState title="No requests yet" text="Open an OPEN group and send a join request." />
      ) : (
        <div className="card p-0">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.groupName}</td>
                    <td>{request.projectTitle || "Untitled project"}</td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td>{formatDateTime(request.updatedAt)}</td>
                    <td>
                      {request.status === "PENDING" ? (
                        <form action={cancelRequest}>
                          <input type="hidden" name="requestId" value={request.id} />
                          <button className="text-sm font-semibold text-red-800" type="submit">
                            Cancel
                          </button>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
