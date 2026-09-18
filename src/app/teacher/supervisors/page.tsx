import { PageHeader } from "@/components/ui";
import { requireTeacher } from "@/lib/auth";
import { listGroups, listSupervisors } from "@/lib/data";

export default async function SupervisorsPage() {
  await requireTeacher();
  const teachers = await listSupervisors();
  const load = await Promise.all([1, 2, 3].map((page) => listGroups({ page })));
  const every = load.flatMap((result) => result.items);

  return (
    <div>
      <PageHeader
        kicker="Faculty"
        title="Supervisors"
        description="Every staff account can supervise a project. Admin accounts are marked separately."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {teachers.map((teacher) => {
          const assigned = every.filter((group) => group.supervisorId === teacher.id);
          return (
            <article key={teacher.id} className="card p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-[#7a7164]">{teacher.role === "admin" ? "Admin" : "Teacher"}</p>
              <h2 className="font-display text-2xl text-[#12324d]">{teacher.fullName}</h2>
              <p className="text-sm text-[#6b6256]">{teacher.department}</p>
              <p className="text-sm">{teacher.email}</p>
              <p className="mt-3 text-sm font-medium">Supervising {assigned.length} group{assigned.length === 1 ? "" : "s"}</p>
              <ul className="mt-2 space-y-1 text-sm text-[#5d564b]">
                {assigned.map((group) => (
                  <li key={group.id}>
                    {group.name} — {group.projectTitle}
                  </li>
                ))}
                {assigned.length === 0 ? <li>No current assignments</li> : null}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
