import Link from "next/link";
import { PageHeader, Pagination, StatusBadge } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { listGroups, listSupervisors } from "@/lib/data";
import { parsePage } from "@/lib/utils";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; supervisor?: string; open?: string; page?: string }>;
}) {
  await requireStudent();
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
        kicker="Directory"
        title="Browse FYDP groups"
        description="Search by project title, group name, or supervisor. Filter to OPEN groups that still have seats."
      />

      <form className="card mb-5 grid gap-3 p-4 md:grid-cols-4">
        <input className="input md:col-span-2" name="q" defaultValue={q} placeholder="Project title, group, or supervisor" />
        <select className="select" name="supervisor" defaultValue={params.supervisor ?? ""}>
          <option value="">All supervisors</option>
          {supervisors.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-[#12324d]">
          <input type="checkbox" name="open" value="1" defaultChecked={openOnly} />
          Open groups only
        </label>
        <button className="btn btn-primary md:col-span-4" type="submit">
          Apply filters
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {result.items.map((group) => (
          <article key={group.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#7a7164]">Group #{group.id}</p>
                <h2 className="font-display text-2xl text-[#12324d]">{group.name}</h2>
              </div>
              <StatusBadge status={group.status} />
            </div>
            <p className="mt-3 text-sm font-medium">{group.projectTitle}</p>
            <p className="mt-1 text-sm text-[#6b6256]">Supervisor: {group.supervisorName ?? "Unassigned"}</p>
            <p className="mt-1 text-sm text-[#6b6256]">Leader: {group.leaderName}</p>
            <p className="mt-3 text-sm">
              {group.memberCount}/6 members · {group.availableSeats} seat{group.availableSeats === 1 ? "" : "s"} left
            </p>
            <Link className="btn btn-ghost mt-4" href={`/student/groups/${group.id}`}>
              View details
            </Link>
          </article>
        ))}
      </div>

      {result.items.length === 0 ? (
        <p className="mt-6 text-sm text-[#6b6256]">No groups match those filters.</p>
      ) : null}

      <Pagination
        page={result.page}
        total={result.total}
        pageSize={result.pageSize}
        basePath="/student/groups"
        query={{ q, supervisor: params.supervisor, open: openOnly ? "1" : undefined }}
      />
    </div>
  );
}
