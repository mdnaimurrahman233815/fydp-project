import Link from "next/link";
import { PageHeader, Pagination, StatusBadge } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { listGroups, listSupervisors } from "@/lib/data";
import { parsePage } from "@/lib/utils";

export default async function TeacherGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; supervisor?: string; open?: string; page?: string }>;
}) {
  await requireTeacher();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const supervisorId = params.supervisor ? Number(params.supervisor) : undefined;
  const openOnly = params.open === "1";
  const page = parsePage(params.page);
  const supervisors = await listSupervisors();
  const result = await listGroups({
    q: q || undefined,
    supervisorId: supervisorId && Number.isInteger(supervisorId) ? supervisorId : undefined,
    openOnly,
    page,
  });

  return (
    <div>
      <PageHeader
        kicker="Oversight"
        title="All groups"
        description="Open groups still need members. Full groups have 6 students and cannot accept more requests."
      />
      <form className="card mb-5 grid gap-3 p-4 md:grid-cols-4">
        <input className="input md:col-span-2" name="q" defaultValue={q} placeholder="Project or group name" />
        <select className="select" name="supervisor" defaultValue={params.supervisor ?? ""}>
          <option value="">All supervisors</option>
          {supervisors.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="open" value="1" defaultChecked={openOnly} />
          Need members
        </label>
        <button className="btn btn-primary md:col-span-4" type="submit">
          Filter
        </button>
      </form>
      <div className="card p-0">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Group</th>
                <th>Project</th>
                <th>Supervisor</th>
                <th>Seats</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((group) => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>{group.projectTitle}</td>
                  <td>{group.supervisorName ?? "Unassigned"}</td>
                  <td>
                    {group.memberCount}/6
                  </td>
                  <td>
                    <StatusBadge status={group.status} />
                  </td>
                  <td>
                    <Link className="text-sm font-semibold text-teal-800" href={`/teacher/groups/${group.id}`}>
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        page={result.page}
        total={result.total}
        pageSize={result.pageSize}
        basePath="/teacher/groups"
        query={{ q, supervisor: params.supervisor, open: openOnly ? "1" : undefined }}
      />
    </div>
  );
}
