import Link from "next/link";
import { PageHeader, Pagination, StatusBadge } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { listStudentsPage } from "@/lib/data";
import { parsePage } from "@/lib/utils";

export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireTeacher();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = parsePage(params.page);
  const result = await listStudentsPage(q || undefined, page);

  return (
    <div>
      <PageHeader kicker="Directory" title="All students" description="Search by name, email, or roll number." />
      <form className="mb-4 flex gap-2">
        <input className="input" name="q" defaultValue={q} placeholder="Search students" />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>
      <div className="card p-0">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll</th>
                <th>Department</th>
                <th>Group</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((student) => (
                <tr key={student.id}>
                  <td>{student.fullName}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.department}</td>
                  <td>
                    {student.groupName ? (
                      <span>
                        {student.groupName} {student.isLeader ? <StatusBadge status="ACCEPTED" /> : null}
                      </span>
                    ) : (
                      "Ungrouped"
                    )}
                  </td>
                  <td>
                    <Link className="text-sm font-semibold text-teal-800" href={`/teacher/messages/student/${student.id}`}>
                      Message
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={result.page} total={result.total} pageSize={result.pageSize} basePath="/teacher/students" query={{ q }} />
    </div>
  );
}
