import { PasswordForm } from "@/components/Forms";
import { PageHeader } from "@/components/ui";
import { requireStudent } from "@/lib/auth";

export default async function StudentProfilePage() {
  const user = await requireStudent();
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        <PageHeader kicker="Account" title="My profile" />
        <section className="card space-y-2 p-5 text-sm">
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Roll number:</strong> {user.rollNumber}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Role:</strong> {user.isLeader ? "Team leader" : "Student"}</p>
          <p><strong>Group:</strong> {user.groupName ?? "None"}</p>
        </section>
      </div>
      <section className="card p-5">
        <h2 className="font-display text-2xl text-[#12324d]">Change password</h2>
        <div className="mt-4">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
